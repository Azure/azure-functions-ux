import { Controller, Post, Body, HttpException, Get, Session, HttpCode, Response } from '@nestjs/common';
import { DeploymentCenterService } from '../deployment-center.service';
import { ConfigService } from '../../shared/config/config.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { Constants } from '../../constants';
import { GUID } from '../../utilities/guid';
import { HttpService } from '../../shared/http/http.service';

@Controller()
export class DropboxController {
  private readonly provider = 'dropbox';
  constructor(
    private dcService: DeploymentCenterService,
    private configService: ConfigService,
    private loggingService: LoggingService,
    private httpService: HttpService
  ) {}

  @Post('api/dropbox/passthrough')
  @HttpCode(200)
  async passthrough(
    @Body('dropBoxToken') dropBoxToken: string,
    @Body('url') url: string,
    @Body('content_type') contentType: string,
    @Body('arg') arg
  ) {
    try {
      const response = await this.httpService.post(url, arg, {
        headers: {
          Authorization: `Bearer ${dropBoxToken}`,
          'Content-Type': contentType || '',
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

  @Get('auth/dropbox/authorize')
  async authorize(@Session() session, @Response() res) {
    let stateKey = '';
    if (session) {
      stateKey = session[Constants.oauthApis.dropbox_state_key] = GUID.newGuid();
    } else {
      // Should be impossible to hit this
      this.loggingService.error({}, '', 'session-not-found');
      throw new HttpException('Session Not Found', 500);
    }

    res.redirect(
      `https://dropbox.com/oauth2/authorize?client_id=${this.configService.get('DROPBOX_CLIENT_ID')}&redirect_uri=${this.configService.get(
        'DROPBOX_REDIRECT_URL'
      )}&response_type=code&state=${this.dcService.hashStateGuid(stateKey).substr(0, 10)}`
    );
  }

  @Get('auth/dropbox/callback')
  callback() {
    return 'Successfully Authenticated. Redirecting...';
  }

  @Post('auth/dropbox/getToken')
  @HttpCode(200)
  async getToken(@Session() session, @Body('redirUrl') redirUrl: string) {
    const state = this.dcService.getParameterByName('state', redirUrl);
    if (
      !session ||
      !session[Constants.oauthApis.dropbox_state_key] ||
      this.dcService.hashStateGuid(session[Constants.oauthApis.dropbox_state_key]).substr(0, 10) !== state
    ) {
      this.loggingService.error({}, '', 'dropbox-invalid-sate-key');
      throw new HttpException('Not Authorized', 403);
    }
    const code = this.dcService.getParameterByName('code', redirUrl);
    try {
      const r = await this.httpService.post<{ access_token: string }>(
        'https://api.dropbox.com/oauth2/token',
        `code=${code}&grant_type=authorization_code&redirect_uri=${process.env.DROPBOX_REDIRECT_URL}&client_id=${
          process.env.DROPBOX_CLIENT_ID
        }&client_secret=${process.env.DROPBOX_CLIENT_SECRET}`,
        {
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return {
        accessToken: r.data.access_token,
        refreshToken: '',
        environment: null,
      };
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException('Internal Server Error', 500);
    }
  }
}
