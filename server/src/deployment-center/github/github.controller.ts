import {
  Controller,
  Post,
  Body,
  HttpException,
  Response,
  Get,
  Session,
  HttpCode,
  Res,
  Put,
  Query,
  Headers,
  Param,
  Patch,
} from '@nestjs/common';
import { detectProjectFolders } from '@azure/web-apps-framework-detection';
import * as sodium from 'tweetsodium';
import { DeploymentCenterService } from '../deployment-center.service';
import { ConfigService } from '../../shared/config/config.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { HttpService } from '../../shared/http/http.service';
import { Constants } from '../../constants';
import { GUID } from '../../utilities/guid';
import { GitHubActionWorkflowRequestContent, GitHubSecretPublicKey, GitHubCommit } from './github';
import {
  EnvironmentUrlMappings,
  Environments,
  ReactViewsEnvironmentUrlMappings,
  ReactViewsEnvironment,
  ExtensionMappings,
  ExtensionNames,
} from '../deployment-center';
import { CloudType, StaticReactConfig } from '../../types/config';

const githubOrigin = 'https://github.com';

@Controller()
export class GithubController {
  private readonly githubApiUrl = 'https://api.github.com';
  private readonly fileModes = {
    file: '100644',
    folder: '040000',
  };

  constructor(
    private dcService: DeploymentCenterService,
    private configService: ConfigService,
    private loggingService: LoggingService,
    private httpService: HttpService
  ) {}

  @Post('api/github/passthrough')
  @HttpCode(200)
  async passthrough(@Body('gitHubToken') gitHubToken: string, @Body('url') url: string, @Res() res, @Body('method') method?: string) {
    try {
      const urlObj = new URL(url);
      if (urlObj.origin === githubOrigin) {
        let response;
        if (method === 'POST') {
          response = await this.httpService.post(
            url,
            {},
            {
              headers: this._getAuthorizationHeader(gitHubToken),
            }
          );
        } else {
          response = await this.httpService.get(url, {
            headers: this._getAuthorizationHeader(gitHubToken),
          });
        }

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
      } else {
        throw new HttpException('The url is not valid', 400);
      }
    } catch (err) {
      this.httpService.handleError(err);
    }
  }

  @Post('api/github/getUser')
  @HttpCode(200)
  async getUser(@Body('gitHubToken') gitHubToken: string, @Res() res) {
    const url = `${this.githubApiUrl}/user`;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/createUserRepository')
  @HttpCode(200)
  async createUserRepository(@Body('gitHubToken') gitHubToken: string, @Body('repo') repo: string, @Res() res) {
    const url = `${this.githubApiUrl}/user/repos`;
    await this._makePostCallWithLinkAndOAuthHeaders(url, gitHubToken, res, { name: repo });
  }

  @Put('api/github/addSecretToRepository')
  @HttpCode(200)
  async addSecretToRepository(
    @Body('gitHubToken') gitHubToken: string,
    @Body('repo') repo: string,
    @Body('secretName') secretName: string,
    @Body('secretValue') secretValue: string
  ) {
    const publicKey = await this._getGitHubRepoPublicKey(gitHubToken, repo);
    this._putGitHubRepoSecret(gitHubToken, publicKey, repo, secretName, secretValue);
  }

  @Put('api/github/addRespositoryVariable')
  @HttpCode(200)
  async addRespositoryVariable(
    @Body('gitHubToken') gitHubToken: string,
    @Body('repo') repo: string,
    @Body('variableName') variableName: string,
    @Body('variableValue') variableValue: string,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${repo}/actions/variables`;
    await this._makePostCallWithLinkAndOAuthHeaders(url, gitHubToken, res, { name: variableName, value: variableValue });
  }

  @Post('api/github/createRepoFromGitHubTemplate')
  @HttpCode(200)
  async createRepoFromGitHubTemplate(
    @Body('gitHubToken') gitHubToken: string,
    @Body('templateOwner') templateOwner: string,
    @Body('templateRepo') templateRepo: string,
    @Body('gitHubUserName') gitHubUserName: string,
    @Body('gitHubRepositoryName') gitHubRepositoryName: string,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${templateOwner}/${templateRepo}/generate`;
    await this._makePostCallWithLinkAndOAuthHeaders(url, gitHubToken, res, {
      owner: gitHubUserName,
      name: gitHubRepositoryName,
    });
  }

  @Post('api/github/getOrganizations')
  @HttpCode(200)
  async getOrganizations(@Body('gitHubToken') gitHubToken: string, @Body('page') page: number, @Res() res) {
    const url = `${this.githubApiUrl}/user/orgs?page=${page}`;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/createOrgRepository')
  @HttpCode(200)
  async createOrgRepository(@Body('gitHubToken') gitHubToken: string, @Body('org') org: string, @Body('repo') repo: string, @Res() res) {
    const url = `${this.githubApiUrl}/orgs/${org}/repos`;
    await this._makePostCallWithLinkAndOAuthHeaders(url, gitHubToken, res, { name: repo });
  }

  @Post('api/github/getOrgRepositories')
  @HttpCode(200)
  async getOrgRepositories(@Body('gitHubToken') gitHubToken: string, @Body('org') org: string, @Body('page') page: number, @Res() res) {
    const url = `${this.githubApiUrl}/orgs/${org}/repos?page=${page}&sort=pushed`;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/getSearchOrgRepositories')
  @HttpCode(200)
  async getSearchOrgRepositories(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('searchTerm') searchTerm: string,
    @Body('page') page: number
  ) {
    try {
      const url = `${this.githubApiUrl}/search/repositories?q=${searchTerm} in:name+org:${org}+fork:true&per_page=100&sort=pushed`;
      // Successive searchTerms have zero white space char added to front
      const encodedURI = encodeURI(url).replace('%E2%80%8B/g', '');
      const r = await this.httpService.get(encodedURI, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });
      return r.data.items;
    } catch (err) {
      this.loggingService.error(`Failed to retrieve org repositories with given search term. ${err}`);
      this.httpService.handleError(err);
    }
  }

  @Post('api/github/getUserRepositories')
  @HttpCode(200)
  async getUserRepositories(@Body('gitHubToken') gitHubToken: string, @Body('page') page: number, @Res() res) {
    const url = `${this.githubApiUrl}/user/repos?type=owner&page=${page}&sort=pushed`;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/getSearchUserRepositories')
  @HttpCode(200)
  async getSearchUserRepositories(@Body('gitHubToken') gitHubToken: string, @Body('searchTerm') searchTerm: string) {
    const userResponse = await this.httpService.get(`${this.githubApiUrl}/user`, { headers: this._getAuthorizationHeader(gitHubToken) });
    const username = userResponse.data.login;

    try {
      const url = `${this.githubApiUrl}/search/repositories?q=${searchTerm} in:name+user:${username}+fork:true&per_page=100&sort=pushed`;
      // Successive searchTerms have zero white space char added to front
      const encodedURI = encodeURI(url).replace('%E2%80%8B/g', '');
      const r = await this.httpService.get(encodedURI, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });
      return r.data.items;
    } catch (err) {
      this.loggingService.error(`Failed to retrieve user repositories with given search term. ${err}`);
      this.httpService.handleError(err);
    }
  }

  @Post('api/github/getBranches')
  @HttpCode(200)
  async getBranches(
    @Body('gitHubToken') gitHubToken: string,
    @Body('page') page: number,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/branches?per_page=100&page=${page}`;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/getWorkflowConfiguration')
  @HttpCode(200)
  async getWorkflowConfiguration(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('workflowYmlPath') workflowYmlPath: string,
    @Body('branchName') branchName: string,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/contents/${workflowYmlPath}?ref=${branchName}`;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/getAllWorkflowConfigurations')
  @HttpCode(200)
  async getAllWorkflowConfigurations(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('branchName') branchName: string,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/contents/.github/workflows?ref=${branchName}`;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/listJobsForWorkflowRun')
  @HttpCode(200)
  async listJobsForWorkflowRun(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('workflowRunId') workflowRunId: string,
    @Body('page') page: number,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/actions/runs/${workflowRunId}/jobs?page=${page}`;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/listWorkflowRuns')
  @HttpCode(200)
  async listWorkflowRuns(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('workflowFileName') workflowFileName: string,
    @Body('page') page: number,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/actions/workflows/${workflowFileName}/runs?page=${page}`;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/getWorkflowRunLogs')
  @HttpCode(200)
  async getJobLogs(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('runId') runId: number,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/actions/runs/${runId}/logs`;
    try {
      await this.httpService
        .get(url, {
          headers: this._getAuthorizationHeader(gitHubToken),
          responseType: 'arraybuffer',
        })
        .then(response => {
          res.json(response.data);
        });
    } catch (err) {
      this.loggingService.error(`Failed to get workflow run logs.`);
      this.httpService.handleError(err);
    }
  }

  @Post('api/github/getWorkflowRun')
  @HttpCode(200)
  async getWorkflowRun(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('runId') runId: number,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/actions/runs/${runId}`;
    try {
      await this.httpService
        .get(url, {
          headers: this._getAuthorizationHeader(gitHubToken),
        })
        .then(response => {
          res.json(response.data);
        });
    } catch (err) {
      this.loggingService.error(`Failed to get workflow run.`);
      this.httpService.handleError(err);
    }
  }

  @Post('api/github/deleteWorkflowRun')
  @HttpCode(200)
  async deleteWorkflowRun(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('runId') runId: number
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/actions/runs/${runId}`;
    try {
      await this.httpService.delete(url, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });
    } catch (err) {
      this.loggingService.error(`Failed to delete workflow run.`);
      this.httpService.handleError(err);
    }
  }

  @Post('api/github/cancelWorkflowRun')
  @HttpCode(200)
  async cancelWorkflowRun(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('workflowId') workflowId: string,
    @Res() res
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/actions/runs/${workflowId}/cancel`;
    await this._makePostCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Put('api/github/actionWorkflow')
  @HttpCode(200)
  async actionWorkflow(
    @Body('authToken') authToken: string,
    @Body('gitHubToken') gitHubToken: string,
    @Body('content') content: GitHubActionWorkflowRequestContent,
    @Body('replacementPublishUrl') replacementPublishUrl?: string
  ) {
    // NOTE(michinoy): In order for the action workflow to successfully execute, it needs to have the secret allowing access
    // to the web app. This secret is the publish profile. This one method will retrieve publish profile, encrypt it, put it
    // as a GitHub secret, and then publish the workflow file.

    const publishProfileRequest = this.dcService.getSitePublishProfile(authToken, content.resourceId);
    const publicKeyRequest = this._getGitHubRepoPublicKey(gitHubToken, content.commit.repoName);
    const [publishProfile, publicKey] = await Promise.all([publishProfileRequest, publicKeyRequest]);

    const profile = replacementPublishUrl ? this._replacePublishUrlInProfile(publishProfile, replacementPublishUrl) : publishProfile;

    const {
      commit,
      secretName,
      containerUsernameSecretName,
      containerUsernameSecretValue,
      containerPasswordSecretName,
      containerPasswordSecretValue,
    } = content;

    // NOTE(michinoy): If this is a setup for containers, the username and passwords also need to be stored as secrets
    // along with the publish profile.
    if (containerUsernameSecretName && containerUsernameSecretValue && containerPasswordSecretName && containerPasswordSecretValue) {
      await Promise.all([
        this._putGitHubRepoSecret(gitHubToken, publicKey, commit.repoName, secretName, profile),
        this._putGitHubRepoSecret(gitHubToken, publicKey, commit.repoName, containerUsernameSecretName, containerUsernameSecretValue),
        this._putGitHubRepoSecret(gitHubToken, publicKey, commit.repoName, containerPasswordSecretName, containerPasswordSecretValue),
      ]);
    } else {
      await this._putGitHubRepoSecret(gitHubToken, publicKey, commit.repoName, secretName, profile);
    }

    await this._commitFile(gitHubToken, content);
  }

  @Post('api/github/deleteActionWorkflow')
  @HttpCode(200)
  async deleteActionWorkflow(@Body('gitHubToken') gitHubToken: string, @Body('deleteCommit') deleteCommit: GitHubCommit) {
    const url = `${this.githubApiUrl}/repos/${deleteCommit.repoName}/contents/${deleteCommit.filePath}`;

    try {
      await this.httpService.delete(url, {
        headers: this._getAuthorizationHeader(gitHubToken),
        data: deleteCommit,
      });
    } catch (err) {
      this.loggingService.error(
        `Failed to delete action workflow '${deleteCommit.filePath}' on branch '${deleteCommit.branchName}' in repo '${deleteCommit.repoName}'.`
      );
      this.httpService.handleError(err);
    }
  }

  @Post('api/github/dispatchWorkflow')
  @HttpCode(200)
  async dispatchWorkflow(
    @Body('gitHubToken') gitHubToken: string,
    @Body('repo') repo: string,
    @Body('workflowFileName') workflowFileName: string,
    @Body('data') data: string
  ) {
    const url = `${this.githubApiUrl}/repos/${repo}/actions/workflows/${workflowFileName}/dispatches`;

    try {
      await this.httpService.post(url, data, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });
    } catch (err) {
      this.loggingService.error(`Failed to dispatch workflow file.`);
      this.httpService.handleError(err);
    }
  }

  @Post('api/github/reRunWorkflow')
  @HttpCode(200)
  async rerunWorkflow(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('runId') runId: string,
    @Body('data') data: string
  ) {
    const url = `${this.githubApiUrl}/repos/${org}/${repo}/actions/runs/${runId}/rerun`;

    try {
      await this.httpService.post(url, data, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });
    } catch (err) {
      this.loggingService.error(`Failed to dispatch workflow file.`);
      this.httpService.handleError(err);
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
      `${Constants.oauthApis.githubApiUri}/authorize?client_id=${this._getGitHubClientId()}&redirect_uri=${this._getRedirectUri(
        host
      )}&scope=admin:repo_hook+repo+workflow&response_type=code&state=${this.dcService.hashStateGuid(stateKey)}`
    );
  }

  @Get('auth/github/reactviews/callback/env/:env/extension/:extension')
  async callbackReactViewRouter(@Res() res, @Query('code') code, @Query('state') state, @Param('env') env, @Param('extension') extension) {
    const envToUpper = (env && (env as string).toUpperCase()) || '';
    const envUri =
      ReactViewsEnvironmentUrlMappings.environmentToUrlMap[envToUpper] ||
      ReactViewsEnvironmentUrlMappings.environmentToUrlMap[ReactViewsEnvironment.Prod];

    const extensionToUpper = (extension && (extension as string).toUpperCase()) || '';
    const extensionName =
      ExtensionMappings.extensionToExtensionNameMap[extensionToUpper] ||
      ExtensionMappings.extensionToExtensionNameMap[ExtensionNames.Websites];
    res.redirect(`${envUri}/TokenAuthorize/ExtensionName/${extensionName}?code=${code}&state=${state}`);
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

  @Post('auth/github/getToken')
  @HttpCode(200)
  async getToken(@Session() session, @Body('redirUrl') redirUrl: string) {
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
        client_id: this._getGitHubClientId(),
        client_secret: this._getGitHubClientSecret(),
      });
      const token = this.dcService.getParameterByName('access_token', `?${r.data}`);
      return {
        accessToken: token,
        refreshToken: null,
        environment: null,
      };
    } catch (err) {
      this.httpService.handleError(err);
    }
  }

  @Get('auth/github/createClientId')
  clientId() {
    return { client_id: this._getGitHubForCreatesClientId() };
  }

  @Get('auth/github/reactViewsV2ClientId')
  reactViewsV2ClientId() {
    return { client_id: this._getGitHubForReactViewsV2ClientId() };
  }

  @Post('auth/github/generateReactViewsV2AccessToken')
  @HttpCode(200)
  async generateReactViewsV2AccessToken(@Body('code') code: string, @Body('state') state: string) {
    if (!code || !state) {
      throw new HttpException('Code and State are required', 400);
    }

    try {
      const r = await this.httpService.post(`${Constants.oauthApis.githubApiUri}/access_token`, {
        code,
        state,
        client_id: this._getGitHubForReactViewsV2ClientId(),
        client_secret: this._getGitHubForReactViewsV2ClientSecret(),
      });
      const token = this.dcService.getParameterByName('access_token', `?${r.data}`);
      return {
        accessToken: token,
        refreshToken: null,
        environment: null,
      };
    } catch (err) {
      this.httpService.handleError(err);
    }
  }

  @Post('auth/github/generateCreateAccessToken')
  @HttpCode(200)
  async generateAccessToken(@Body('code') code: string, @Body('state') state: string) {
    if (!code || !state) {
      throw new HttpException('Code and State are required', 400);
    }

    try {
      const r = await this.httpService.post(`${Constants.oauthApis.githubApiUri}/access_token`, {
        code,
        state,
        client_id: this._getGitHubForCreatesClientId(),
        client_secret: this._getGitHubForCreatesClientSecret(),
      });
      const token = this.dcService.getParameterByName('access_token', `?${r.data}`);
      return {
        accessToken: token,
        refreshToken: null,
        environment: null,
      };
    } catch (err) {
      this.httpService.handleError(err);
    }
  }

  @Patch('api/github/resetToken')
  @HttpCode(200)
  async resetToken(@Body('gitHubToken') gitHubToken: string) {
    try {
      const r = await this.httpService.patch(
        `${this.githubApiUrl}/applications/${this._getGitHubClientId()}/token`,
        {
          access_token: gitHubToken,
        },
        {
          headers: this._getGitHubOAuthAppBasicAuthHeader(),
        }
      );

      return {
        accessToken: r.data.token,
        refreshToken: null,
        environment: null,
      };
    } catch (err) {
      this.loggingService.error(`Failed to refresh token.`);
      this.httpService.handleError(err);
    }
  }

  @Post('api/github/detectFrameworks')
  @HttpCode(200)
  async detectFrameworks(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('branch') branch: string,
    @Body('frameworksUri') frameworksUri: string,
    @Body('filterDescendantFolders') filterDescendantFolders = true,
    @Res() res
  ) {
    try {
      const frameworks = await detectProjectFolders(
        `${githubOrigin}/${org}/${repo}/tree/${branch}`,
        gitHubToken,
        null,
        frameworksUri,
        filterDescendantFolders
      );
      res.json(frameworks);
    } catch (err) {
      this.loggingService.error(`Failed to detect frameworks.`);
      this.httpService.handleError(err);
    }
  }

  private _trimAppLocation(appLocation: string): string {
    if (typeof appLocation !== 'string') {
      throw new HttpException(`'appLocation' property should be a string. `, 400);
    }

    let trimmedString: string = appLocation;
    if (trimmedString.startsWith('/')) {
      //ex: /src >> src
      trimmedString = trimmedString.substring(1);
    } else if (trimmedString.startsWith('./')) {
      //ex: ./src >> src
      trimmedString = trimmedString.substring(2);
    }

    if (trimmedString.endsWith('/')) {
      //ex: src/ >> src
      trimmedString = trimmedString.substring(0, trimmedString.length - 1);
    }

    return trimmedString;
  }

  @Post('api/github/getConfigFileFromRepo')
  @HttpCode(200)
  async getConfigFileFromRepo(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('branchName') branchName: string,
    @Body('appLocation') appLocation: string = '',
    @Body('configFileLocation') configFileLocation: string = '',
    @Body('fileName') fileName: string = '',
    @Res() res
  ) {
    const baseUrl = configFileLocation
      ? `${this.githubApiUrl}/repos/${org}/${repo}/contents/${this._trimAppLocation(configFileLocation)}/${fileName}`
      : !appLocation || appLocation === '/'
      ? `${this.githubApiUrl}/repos/${org}/${repo}/contents/${fileName}`
      : `${this.githubApiUrl}/repos/${org}/${repo}/contents/${this._trimAppLocation(appLocation)}/${fileName}`;

    const url = branchName ? `${baseUrl}?ref=${branchName}` : baseUrl;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  // TODO (miabe): Once getConfigFileFromRepo is deployed in prod, I will switch to getConfigFileFromRepo and delete this. (WI#: 28699788)
  @Post('api/github/getStaticWebAppConfiguration')
  @HttpCode(200)
  async getStaticWebAppConfiguration(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('branchName') branchName: string,
    @Body('appLocation') appLocation: string = '',
    @Body('swaConfigFileLocation') swaConfigFileLocation: string = '',
    @Res() res
  ) {
    // If appLocation is not specify, or is the root, we will look for the file in the root of the repo.
    const baseUrl = swaConfigFileLocation
      ? `${this.githubApiUrl}/repos/${org}/${repo}/contents/${this._trimAppLocation(swaConfigFileLocation)}/staticwebapp.config.json`
      : !appLocation || appLocation === '/'
      ? `${this.githubApiUrl}/repos/${org}/${repo}/contents/staticwebapp.config.json`
      : `${this.githubApiUrl}/repos/${org}/${repo}/contents/${this._trimAppLocation(appLocation)}/staticwebapp.config.json`;

    const url = branchName ? `${baseUrl}?ref=${branchName}` : baseUrl;
    await this._makeGetCallWithLinkAndOAuthHeaders(url, gitHubToken, res);
  }

  @Post('api/github/getFilePathWithTreeSearch')
  @HttpCode(200)
  async getTree(
    @Body('gitHubToken') gitHubToken: string,
    @Body('org') org: string,
    @Body('repo') repo: string,
    @Body('fileName') fileName: string,
    @Body('appLocation') appLocation: string,
    @Body('branchName') branchName: string,
    @Res() res
  ) {
    const repoBranchName = branchName ? branchName : await this._getDefaultBranch(org, repo, gitHubToken);
    const response = await this._getFilePathForSpecifiedFile(org, repo, repoBranchName, gitHubToken, fileName, appLocation);
    return res.json(response);
  }

  @Put('api/github/updateGitHubContent')
  @HttpCode(200)
  async updateGitHubContent(@Body('gitHubToken') gitHubToken: string, @Body('commit') commit: GitHubCommit) {
    await this._commitGitHubFile(gitHubToken, commit);
  }

  private _getAuthorizationHeader(accessToken: string): { Authorization: string } {
    return {
      Authorization: `token ${accessToken}`,
    };
  }

  private _getGitHubOAuthAppBasicAuthHeader(): { Authorization: string } {
    const basicAuthValue = Buffer.from(`${this._getGitHubClientId()}:${this._getGitHubClientSecret()}`, 'utf8').toString('base64');
    return {
      Authorization: `Basic ${basicAuthValue}`,
    };
  }

  private async _getGitHubRepoPublicKey(gitHubToken: string, repoName: string): Promise<GitHubSecretPublicKey> {
    const url = `${this.githubApiUrl}/repos/${repoName}/actions/secrets/public-key`;

    try {
      const response = await this.httpService.get(url, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });

      return response.data;
    } catch (err) {
      this.loggingService.error(`Failed to get the public key for '${repoName}'.`);
      this.httpService.handleError(err);
    }
  }

  private async _putGitHubRepoSecret(
    gitHubToken: string,
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

    const encryptedBytes = sodium.seal(messageBytes, keyBytes);
    const encrypted = Buffer.from(encryptedBytes).toString('base64');

    try {
      const config = {
        headers: this._getAuthorizationHeader(gitHubToken),
      };

      const data = {
        encrypted_value: encrypted,
        key_id: publicKey.key_id,
      };

      await this.httpService.put(url, data, config);
    } catch (err) {
      this.loggingService.error(`Failed to set the publish profile secret to GitHub repo '${repoName}'.`);
      this.httpService.handleError(err);
    }
  }

  private async _commitFile(gitHubToken: string, content: GitHubActionWorkflowRequestContent) {
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
        headers: this._getAuthorizationHeader(gitHubToken),
      });
    } catch (err) {
      this.loggingService.error(
        `Failed to commit action workflow '${content.commit.filePath}' on branch '${content.commit.branchName}' in repo '${content.commit.repoName}'.`
      );
      this.httpService.handleError(err);
    }
  }

  private async _commitGitHubFile(gitHubToken: string, commit: GitHubCommit) {
    const url = `${this.githubApiUrl}/repos/${commit.repoName}/contents/${this._trimAppLocation(commit.filePath)}`;

    const commitContent = {
      message: commit.message,
      content: commit.contentBase64Encoded,
      sha: commit.sha,
      branch: commit.branchName,
      comitter: commit.committer,
    };

    try {
      await this.httpService.put(url, commitContent, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });
    } catch (err) {
      this.loggingService.error(
        `Failed to commit GitHub '${commit.filePath}' on branch '${commit.branchName}' in repo '${commit.repoName}'.`
      );
      this.httpService.handleError(err);
    }
  }

  private _getEnvironment(hostUrl: string): Environments {
    const hostUrlToLower = (hostUrl || '').toLocaleLowerCase();
    for (const url in EnvironmentUrlMappings.urlToEnvironmentMap) {
      if (EnvironmentUrlMappings.urlToEnvironmentMap[url]) {
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

  private _replacePublishUrlInProfile(profile: string, replacementPublishUrl: string): string {
    // NOTE(michinoy): If the profile already contains the replacement publish URL, than dont make any changes.
    // else replace the specific publish url for msdeploy.
    if (profile.indexOf(replacementPublishUrl) > -1) {
      return profile;
    }

    this.loggingService.error(`Replacing existing publishing url with scm url '${replacementPublishUrl}'`);

    // NOTE(michinoy): This is a temporary solution. We need to replace the publish URL to the scm url
    // for GitHub Actions to be operational.
    const startText = 'publishMethod="MSDeploy" publishUrl="';
    const endText = ':443" msdeploySite=';
    const startIndex = profile.indexOf(startText) + startText.length;
    const endIndex = profile.indexOf(endText);
    const beginningOfProfile = profile.substring(0, startIndex);
    const endOfProfile = profile.substring(endIndex, profile.length);

    return `${beginningOfProfile}${replacementPublishUrl}${endOfProfile}`;
  }

  get staticReactConfig(): StaticReactConfig {
    const acceptedOriginsString = process.env.APPSVC_ACCEPTED_ORIGINS_SUFFIX;
    let acceptedOrigins: string[] = [];
    if (acceptedOriginsString) {
      acceptedOrigins = acceptedOriginsString.split(',');
    }

    return {
      env: {
        appName: process.env.WEBSITE_SITE_NAME,
        hostName: process.env.WEBSITE_HOSTNAME,
        cloud: process.env.APPSVC_CLOUD as CloudType,
        acceptedOriginsSuffix: acceptedOrigins,
      },
      version: process.env.VERSION,
    };
  }

  private _getGitHubClientId(): string {
    const config = this.staticReactConfig;
    if (config.env && config.env.cloud === CloudType.public) {
      return this.configService.get('GITHUB_CLIENT_ID');
    } else {
      return this.configService.get('GITHUB_NATIONALCLOUDS_CLIENT_ID');
    }
  }

  private _getGitHubClientSecret(): string {
    const config = this.staticReactConfig;
    if (config.env && config.env.cloud === CloudType.public) {
      return this.configService.get('GITHUB_CLIENT_SECRET');
    } else {
      return this.configService.get('GITHUB_NATIONALCLOUDS_CLIENT_SECRET');
    }
  }

  private _getGitHubForCreatesClientId() {
    const config = this.staticReactConfig;
    if (config.env && config.env.cloud === CloudType.public) {
      return this.configService.get('GITHUB_FOR_CREATES_CLIENT_ID');
    } else {
      return this.configService.get('GITHUB_FOR_CREATES_NATIONALCLOUDS_CLIENT_ID');
    }
  }

  private _getGitHubForCreatesClientSecret() {
    const config = this.staticReactConfig;
    if (config.env && config.env.cloud === CloudType.public) {
      return this.configService.get('GITHUB_FOR_CREATES_CLIENT_SECRET');
    } else {
      return this.configService.get('GITHUB_FOR_CREATES_NATIONALCLOUDS_CLIENT_SECRET');
    }
  }

  private _getGitHubForReactViewsV2ClientId() {
    return this.configService.get('GITHUB_FOR_REACTVIEWS_V2_CLIENT_ID');
  }

  private _getGitHubForReactViewsV2ClientSecret() {
    return this.configService.get('GITHUB_FOR_REACTVIEWS_V2_CLIENT_SECRET');
  }

  private async _makeGetCallWithLinkAndOAuthHeaders(url: string, gitHubToken: string, res) {
    try {
      const response = await this.httpService.get(url, {
        headers: this._getAuthorizationHeader(gitHubToken),
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

      if (response.headers['x-ratelimit-remaining']) {
        res.setHeader('x-ratelimit-remaining', response.headers['x-ratelimit-remaining']);
      }

      if (response.headers['x-ratelimit-reset']) {
        res.setHeader('x-ratelimit-reset', response.headers['x-ratelimit-reset']);
      }

      res.setHeader('access-control-expose-headers', 'link, x-oauth-scopes');
      res.json(response.data);
    } catch (err) {
      this.httpService.handleError(err);
    }
  }

  private async _makePostCallWithLinkAndOAuthHeaders(url: string, gitHubToken: string, res, body = {}) {
    try {
      const response = await this.httpService.post(url, body, {
        headers: this._getAuthorizationHeader(gitHubToken),
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

      if (response.headers['x-ratelimit-remaining']) {
        res.setHeader('x-ratelimit-remaining', response.headers['x-ratelimit-remaining']);
      }

      if (response.headers['x-ratelimit-reset']) {
        res.setHeader('x-ratelimit-reset', response.headers['x-ratelimit-reset']);
      }

      res.setHeader('access-control-expose-headers', 'link, x-oauth-scopes');
      res.json(response.data);
    } catch (err) {
      this.httpService.handleError(err);
    }
  }

  private _ignoreBicepInfraFolderRule = (currentTree, treesAtCurrentLevel) => {
    if (currentTree.mode === this.fileModes.folder && currentTree.path === 'infra') {
      for (const t of treesAtCurrentLevel) {
        if (t.path === 'azure.yaml') {
          return true;
        }
      }
      return false;
    }
  };

  private async _getFilePathForSpecifiedFile(userName, repoName, branchName, gitHubToken, fileName, appLocation) {
    const appLocationFolder = await this._getAppLocationFolder(userName, repoName, branchName, gitHubToken, appLocation);
    if (appLocationFolder) {
      return await this._getFolderPathHelper(appLocationFolder, gitHubToken, fileName, appLocation);
    } else {
      throw new HttpException('Failed to retrieve data.', 500);
    }
  }

  // this should return app level files and folders plus, path to the folder.
  private async _getAppLocationFolder(userName, repoName, branchName, gitHubToken, appLocation) {
    const url = `${this.githubApiUrl}/repos/${userName}/${repoName}/git/trees/${branchName}`;
    try {
      const response = await this.httpService.get(url, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });

      const rootFoldersAndFiles = response?.data?.tree;

      if (rootFoldersAndFiles) {
        return await this._getAppLocationFolderHelper(rootFoldersAndFiles, appLocation, '', gitHubToken);
      } else {
        this.loggingService.log('No data found in app location folder.');
        return undefined;
      }
    } catch (err) {
      this.loggingService.error(
        `Either failed to retrieve app location folder or failed to retrieve files and folders under specified app location`
      );
      this.httpService.handleError(err);
    }
  }

  private async _getAppLocationFolderHelper(foldersAndFiles, appLocation, folderPath, gitHubToken) {
    const folders = [];
    for (const t of foldersAndFiles) {
      const currentPath = `${folderPath}/${t.path}`;
      if (t.mode === this.fileModes.folder && currentPath.endsWith(appLocation)) {
        try {
          const appFolder = await this.httpService.get(`${t.url}`, {
            headers: this._getAuthorizationHeader(gitHubToken),
          });
          return {
            folderPath: currentPath,
            appFolder: appFolder,
          };
        } catch (err) {
          this.loggingService.error(`Failed to retrieve files and folders under specified app location: ${currentPath}`);
          this.httpService.handleError(err);
        }
      }

      if (t.mode === this.fileModes.folder) {
        folders.push(t);
      }
    }

    if (folders.length === 0) {
      return undefined; // Explicity return undefined to keep searching in other folders.
    }

    for (const folder of folders) {
      try {
        const childFolder = await this.httpService.get(`${folder.url}`, {
          headers: this._getAuthorizationHeader(gitHubToken),
        });
        if (childFolder?.data?.tree?.length > 0) {
          const result = await this._getAppLocationFolderHelper(childFolder, appLocation, `${folderPath}/${folder.path}`, gitHubToken);
          if (result) {
            return result; // Return as soon as the file is found in a child folder
          }
        }
      } catch (err) {
        // Should not throw error since we should keep searching in other folders.
        this.loggingService.error(`Failed to retrieve files and folders with url: ${folder.url}`);
      }
    }

    return undefined;
  }

  private async _getFolderPathHelper(foldersAndPath, gitHubToken, fileName, appLocation) {
    const { folderPath, appFolder } = foldersAndPath;
    const folders = [];
    for (const t of appFolder.data.tree) {
      // find appLocation name if appLocation has value.
      if (t.mode === this.fileModes.file && t.path === fileName) {
        return {
          shouldCreateNewFile: false,
          folderPath,
        };
      }

      if ([this._ignoreBicepInfraFolderRule].some(r => r(t, appFolder.data.tree))) {
        continue;
      }

      if (t.mode === this.fileModes.folder) {
        folders.push(t);
      }
    }

    if (folders.length === 0) {
      return {
        shouldCreateNewFile: true,
        folderPath: appLocation,
        message:
          'We found a app folder, but no more files to search for the file under app location. we create new config file under app location.',
      };
    }

    for (const folder of folders) {
      const path = `${folderPath}/${folder.path}`;
      try {
        const childFolderAndFiles = await this.httpService.get(`${folder.url}`, {
          headers: this._getAuthorizationHeader(gitHubToken),
        });
        if (childFolderAndFiles?.data?.tree) {
          const result = await this._getFolderPathHelper(
            { folderPath: path, appFolder: childFolderAndFiles },
            gitHubToken,
            fileName,
            appLocation
          );
          if (result) {
            return result; // Return as soon as the file is found in a child folder
          }
        }
      } catch (err) {
        // Should not throw error since we should keep searching other folders.
        this.loggingService.error(`Failed to fetch files and folders under ${path}. URL: ${folder.url}`);
      }
    }
  }

  private _getDefaultBranch = async (owner, repo, gitHubToken) => {
    try {
      const repoResponse = await this.httpService.get(`${this.githubApiUrl}/repos/${owner}/${repo}`, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });

      return repoResponse.data.default_branch;
    } catch (err) {
      this.loggingService.error(`Failed to retrieve repo data`);
      this.httpService.handleError(err);
    }
  };
}
