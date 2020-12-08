import { Controller, Post, Body, HttpException, Get, Session, HttpCode, Response, Headers } from '@nestjs/common';
import { DeploymentCenterService } from '../deployment-center.service';
import { ConfigService } from '../../shared/config/config.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { Constants } from '../../constants';
import { GUID } from '../../utilities/guid';
import { HttpService } from '../../shared/http/http.service';
@Controller()
export class BitbucketsController {
  constructor(
    private dcService: DeploymentCenterService,
    private configService: ConfigService,
    private loggingService: LoggingService,
    private httpService: HttpService
  ) {}

  @Post('api/bitbucket/passthrough')
  @HttpCode(200)
  async passthrough(@Body('bitBucketToken') bitBucketToken: string, @Body('url') url: string) {
    try {
      const response = await this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${bitBucketToken}`,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }

  @Get('auth/bitbucket/authorize')
  async authorize(@Session() session, @Response() res) {
    let stateKey = '';
    if (session) {
      stateKey = session[Constants.oauthApis.bitbucket_state_key] = GUID.newGuid();
    } else {
      // Should be impossible to hit this
      this.loggingService.error({}, '', 'session-not-found');
      throw new HttpException('Session Not Found', 500);
    }

    res.redirect(
      `${Constants.oauthApis.bitbucketUri}/authorize?client_id=${this.configService.get(
        'BITBUCKET_CLIENT_ID'
      )}&redirect_uri=${this.configService.get(
        'BITBUCKET_REDIRECT_URL'
      )}&scope=account+repository+webhook&response_type=code&state=${this.dcService.hashStateGuid(stateKey).substr(0, 10)}`
    );
  }

  @Get('auth/bitbucket/callback')
  callback() {
    return 'Successfully Authenticated. Redirecting...';
  }

  @Post('auth/bitbucket/getToken')
  @HttpCode(200)
  async getToken(@Session() session, @Body('redirUrl') redirUrl: string, @Headers('origin') origin: string) {
    const state = this.dcService.getParameterByName('state', redirUrl);
    const environment = this.dcService.getEnvironment(origin);
    if (!environment) {
      throw new HttpException('Invalid Environment', 403);
    }
    if (
      !session ||
      !session[Constants.oauthApis.bitbucket_state_key] ||
      this.dcService.hashStateGuid(session[Constants.oauthApis.bitbucket_state_key]).substr(0, 10) !== state
    ) {
      this.loggingService.error({}, '', 'bitbucket-invalid-sate-key');
      throw new HttpException('Not Authorized', 403);
    }
    const code = this.dcService.getParameterByName('code', redirUrl);
    try {
      const r = await this.httpService.post<{ access_token: string; refresh_token: string }>(
        `${Constants.oauthApis.bitbucketUri}/access_token`,
        `code=${code}&grant_type=authorization_code&redirect_uri=${process.env.BITBUCKET_REDIRECT_URL}`,
        {
          auth: {
            username: process.env.BITBUCKET_CLIENT_ID as string,
            password: process.env.BITBUCKET_CLIENT_SECRET as string,
          },
          headers: {
            Referer: process.env.BITBUCKET_REDIRECT_URL,
            'Content-type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return {
        accessToken: r.data.access_token,
        refreshToken: r.data.refresh_token,
        environment: environment,
      };
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException('Internal Server Error', 500);
    }
  }
}
