import { Controller, Post, Body, HttpException, Response, Get, Session, HttpCode, Res, Put } from '@nestjs/common';
import { DeploymentCenterService } from '../deployment-center.service';
import { ConfigService } from '../../shared/config/config.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { HttpService } from '../../shared/http/http.service';
import { Constants } from '../../constants';
import { GUID } from '../../utilities/guid';
import { GitHubActionWorkflowRequestContent } from './github';
@Controller()
export class GithubController {
  private readonly provider = 'github';
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
    console.log('request received.');
    console.log(authToken);
    console.log(content);
    // GET the publishing profile
    // GET the public key
    // PUT the secret
    // PUT the workflow file
  }

  @Put('api/github/fileContent')
  @HttpCode(200)
  async fileContent(@Body('authToken') authToken: string, @Body('url') url: string, @Body('content') content: any) {
    const tokenData = await this.dcService.getSourceControlToken(authToken, this.provider);

    try {
      await this.httpService.put(url, content, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }

  @Get('auth/github/authorize')
  async authorize(@Session() session, @Response() res) {
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
      )}&redirect_uri=${this.configService.get(
        'GITHUB_REDIRECT_URL'
      )}&scope=admin:repo_hook+repo+workflow&response_type=code&state=${this.dcService.hashStateGuid(stateKey)}`
    );
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
}
