import { Controller, Post, Body, HttpException, Response, Get, Session, HttpCode, Res, Put, Query, Headers, Param } from '@nestjs/common';
import { DeploymentCenterService } from '../deployment-center.service';
import { ConfigService } from '../../shared/config/config.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { HttpService } from '../../shared/http/http.service';
import { Constants } from '../../constants';
import { GUID } from '../../utilities/guid';
import { GitHubActionWorkflowRequestContent, GitHubSecretPublicKey, GitHubCommit } from './github';
import { TokenData, EnvironmentUrlMappings, Environments } from '../deployment-center';

@Controller()
export class GithubController {
  private readonly provider = 'github';
  private readonly githubApiUrl = 'https://api.github.com';

  constructor(
    private dcService: DeploymentCenterService,
    private configService: ConfigService,
    private loggingService: LoggingService,
    private httpService: HttpService
  ) {}

  @Post('api/github/passthrough')
  @HttpCode(200)
  async passthrough(@Body('authToken') authToken: string, @Body('url') url: string, @Res() res) {
    const tokenData = await this.dcService.getSourceControlToken(authToken, this.provider);
    try {
      const response = await this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });
      if (response.headers.link) {
        res.setHeader('link', response.headers.link);
      }

      if (response.headers['x-oauth-scopes']) {
        res.setHeader(
          'x-oauth-scopes',
          response.headers['x-oauth-scopes']
            .split(',')
            .map((value: string) => value.trim())
            .join(',')
        );
      }

      res.json(response.data);
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }

  @Put('api/github/actionWorkflow')
  @HttpCode(200)
  async actionWorkflow(@Body('authToken') authToken: string, @Body('content') content: GitHubActionWorkflowRequestContent) {
    // NOTE(michinoy): In order for the action workflow to succesfully execute, it needs to have the secret allowing access
    // to the web app. This secret is the publish profile. This one method will retrieve publish profile, encrypt it, put it
    // as a GitHub secret, and then publish the workflow file.

    const publishProfileRequest = this.dcService.getSitePublishProfile(authToken, content.resourceId);
    const tokenDataRequest = this.dcService.getSourceControlToken(authToken, this.provider);
    const [publishProfile, tokenData] = await Promise.all([publishProfileRequest, tokenDataRequest]);
    const publicKey = await this._getGitHubRepoPublicKey(tokenData, content.commit.repoName);
    await this._putGitHubRepoSecret(tokenData, publicKey, content.commit.repoName, content.secretName, publishProfile);
    await this._commitFile(tokenData, content);
  }

  @Post('api/github/deleteActionWorkflow')
  @HttpCode(200)
  async deleteActionWorkflow(@Body('authToken') authToken: string, @Body('deleteCommit') deleteCommit: GitHubCommit) {
    const tokenData = await this.dcService.getSourceControlToken(authToken, this.provider);

    const url = `${this.githubApiUrl}/repos/${deleteCommit.repoName}/contents/${deleteCommit.filePath}`;

    try {
      await this.httpService.delete(url, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
        data: deleteCommit,
      });
    } catch (err) {
      this.loggingService.error(
        `Failed to delete action workflow '${deleteCommit.filePath}' on branch '${deleteCommit.branchName}' in repo '${
          deleteCommit.repoName
        }'.`
      );

      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }

  @Get('auth/github/authorize')
  async authorize(@Session() session, @Response() res, @Headers('host') host: string) {
    let stateKey = '';
    if (session) {
      stateKey = session[Constants.oauthApis.github_state_key] = GUID.newGuid();
    } else {
      // Should be impossible to hit this
      this.loggingService.error({}, '', 'session-not-found');
      throw new HttpException('Session Not Found', 500);
    }

    res.redirect(
      `${Constants.oauthApis.githubApiUri}/authorize?client_id=${this.configService.get(
        'GITHUB_CLIENT_ID'
      )}&redirect_uri=${this._getRedirectUri(
        host
      )}&scope=admin:repo_hook+repo+workflow&response_type=code&state=${this.dcService.hashStateGuid(stateKey)}`
    );
  }

  @Get('auth/github/callback/env/:env')
  async callbackRouter(@Res() res, @Query('code') code, @Query('state') state, @Param('env') env) {
    const envToUpper = (env && (env as string).toUpperCase()) || '';
    const envUri = EnvironmentUrlMappings.environmentToUrlMap[envToUpper] || EnvironmentUrlMappings.environmentToUrlMap[Environments.Prod];
    res.redirect(`${envUri}/auth/github/callback?code=${code}&state=${state}`);
  }

  @Get('auth/github/callback')
  callback() {
    return 'Successfully Authenticated. Redirecting...';
  }

  @Post('auth/github/storeToken')
  @HttpCode(200)
  async storeToken(@Session() session, @Body('redirUrl') redirUrl: string, @Body('authToken') authToken: string) {
    const state = this.dcService.getParameterByName('state', redirUrl);
    if (
      !session ||
      !session[Constants.oauthApis.github_state_key] ||
      this.dcService.hashStateGuid(session[Constants.oauthApis.github_state_key]) !== state
    ) {
      this.loggingService.error({}, '', 'github-invalid-sate-key');
      throw new HttpException('Not Authorized', 403);
    }
    const code = this.dcService.getParameterByName('code', redirUrl);

    try {
      const r = await this.httpService.post(`${Constants.oauthApis.githubApiUri}/access_token`, {
        code,
        client_id: this.configService.get('GITHUB_CLIENT_ID'),
        client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
      });
      const token = this.dcService.getParameterByName('access_token', `?${r.data}`);
      this.dcService.saveToken(token, authToken, this.provider);
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException('Internal Server Error', 500);
    }
  }

  private async _getGitHubRepoPublicKey(tokenData: TokenData, repoName: string): Promise<GitHubSecretPublicKey> {
    const url = `${this.githubApiUrl}/repos/${repoName}/actions/secrets/public-key`;

    try {
      const response = await this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });

      return response.data;
    } catch (err) {
      this.loggingService.error(`Failed to get the public key for '${repoName}'.`);

      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }

  private async _putGitHubRepoSecret(
    tokenData: TokenData,
    publicKey: GitHubSecretPublicKey,
    repoName: string,
    secretName: string,
    value: string
  ) {
    // NOTE(michinoy): Refer to:
    // https://developer.github.com/v3/actions/secrets/#create-or-update-a-secret-for-a-repository
    // to learn more about GitHub secrets.

    const url = `${this.githubApiUrl}/repos/${repoName}/actions/secrets/${secretName}`;

    const messageBytes = Buffer.from(value);
    const keyBytes = Buffer.from(publicKey.key, 'base64');

    const sodium = require('tweetsodium');
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);
    const encrypted = Buffer.from(encryptedBytes).toString('base64');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      };

      const data = {
        encrypted_value: encrypted,
        key_id: publicKey.key_id,
      };

      await this.httpService.put(url, data, config);
    } catch (err) {
      this.loggingService.error(`Failed to set the publish profile secret to GitHub repo '${repoName}'.`);

      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }

  private async _commitFile(tokenData: TokenData, content: GitHubActionWorkflowRequestContent) {
    const url = `${this.githubApiUrl}/repos/${content.commit.repoName}/contents/${content.commit.filePath}`;

    const commitContent = {
      message: content.commit.message,
      content: content.commit.contentBase64Encoded,
      sha: content.commit.sha,
      branch: content.commit.branchName,
      comitter: content.commit.committer,
    };

    try {
      await this.httpService.put(url, commitContent, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });
    } catch (err) {
      this.loggingService.error(
        `Failed to commit action workflow '${content.commit.filePath}' on branch '${content.commit.branchName}' in repo '${
          content.commit.repoName
        }'.`
      );

      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }

  private _getEnvironment(hostUrl: string): Environments {
    const hostUrlToLower = (hostUrl || '').toLocaleLowerCase();
    for (const url in EnvironmentUrlMappings.urlToEnvironmentMap) {
      if (!!EnvironmentUrlMappings.urlToEnvironmentMap[url]) {
        const envUrlToLower = url.toLocaleLowerCase();
        if (hostUrlToLower.startsWith(envUrlToLower)) {
          return EnvironmentUrlMappings.urlToEnvironmentMap[url];
        }
      }
    }
    return null;
  }

  private _getRedirectUri(host: string): string {
    const redirectUri =
      this.configService.get('GITHUB_REDIRECT_URL') ||
      `${EnvironmentUrlMappings.environmentToUrlMap[Environments.Prod]}/auth/github/callback`;

    const [redirectUriToLower, hostUrlToLower] = [redirectUri.toLocaleLowerCase(), `https://${host}`.toLocaleLowerCase()];
    const [redirectEnv, clientEnv] = [this._getEnvironment(redirectUriToLower), this._getEnvironment(hostUrlToLower)];

    if (clientEnv && redirectEnv !== clientEnv) {
      // Once GitHub authentication is complete, the browser needs to be redirected to the same host as the parent window that
      // originally launched it. Otherwise, the parent window won't be able to extract the token due to origin mis-match.

      // However, the redirect URL that we pass to GitHub needs to be an exact match or subdirectory of a pre-configured callback URL.
      // - If the host of the parent window matches the host of the pre-configure callback, then we can just use the pre-configured
      //   callback as the redirect URL.
      // - If the host of the parent window doesn't match the host of the pre-configured callback, then we append '/env/<ENV>' to the
      //   pre-configured callback and use this as the redirect URL. When the browser gets redirected to this URL from GitHub, it will
      //   result in an additional redirect to the correct environment where the host will match the parent window's host.
      return `${redirectUri}/env/${clientEnv}`;
    }

    return redirectUri;
  }
}
