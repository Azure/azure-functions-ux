import { Controller, Post, Body, HttpException, Get, Session, HttpCode, Response } from '@nestjs/common';
import { DeploymentCenterService } from '../deployment-center.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { Constants } from '../../constants';
import { GUID } from '../../utilities/guid';
import { HttpService } from '../../shared/http/http.service';
@Controller()
export class OnedriveController {
  constructor(private dcService: DeploymentCenterService, private loggingService: LoggingService, private httpService: HttpService) {}

  @Post('api/onedrive/passthrough')
  @HttpCode(200)
  async passthrough(@Body('oneDriveToken') oneDriveToken: string, @Body('url') url: string) {
    try {
      const response = await this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${oneDriveToken}`,
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

  @Get('auth/onedrive/authorize')
  async authorize(@Session() session, @Response() res) {
    let stateKey = '';
    if (session) {
      stateKey = session[Constants.oauthApis.onedrive_state_key] = GUID.newGuid();
    } else {
      // Should be impossible to hit this
      this.loggingService.error({}, '', 'session-not-found');
      throw new HttpException('Session Not Found', 500);
    }

    res.redirect(
      `https://login.live.com/oauth20_authorize.srf?client_id=${
        process.env.ONEDRIVE_CLIENT_ID
      }&scope=offline_access,onedrive.appfolder&response_type=code&redirect_uri=${
        process.env.ONEDRIVE_REDIRECT_URL
      }&state=${this.dcService.hashStateGuid(stateKey).substr(0, 10)}`
    );
  }

  @Get('auth/onedrive/callback')
  callback() {
    return 'Successfully Authenticated. Redirecting...';
  }

  @Post('auth/onedrive/getToken')
  @HttpCode(200)
  async getToken(@Session() session, @Body('redirUrl') redirUrl: string) {
    const state = this.dcService.getParameterByName('state', redirUrl);
    if (
      !session ||
      !session[Constants.oauthApis.onedrive_state_key] ||
      this.dcService.hashStateGuid(session[Constants.oauthApis.onedrive_state_key]).substr(0, 10) !== state
    ) {
      this.loggingService.error({}, '', 'onedrive-invalid-sate-key');
      throw new HttpException('Not Authorized', 403);
    }
    const code = this.dcService.getParameterByName('code', redirUrl);
    try {
      const r = await this.httpService.post<{ access_token: string; refresh_token: string }>(
        'https://login.live.com/oauth20_token.srf',
        `code=${code}&grant_type=authorization_code&redirect_uri=${process.env.ONEDRIVE_REDIRECT_URL}&client_id=${
          process.env.ONEDRIVE_CLIENT_ID
        }&client_secret=${process.env.ONEDRIVE_CLIENT_SECRET}`,
        {
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        accessToken: r.data.access_token,
        refreshToken: r.data.refresh_token,
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
