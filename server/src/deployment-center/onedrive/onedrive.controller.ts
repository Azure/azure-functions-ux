import { Controller, Post, Body, HttpException, Get, Session, HttpCode, Response, Headers } from '@nestjs/common';
import { DeploymentCenterService } from '../deployment-center.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { Constants } from '../../constants';
import { GUID } from '../../utilities/guid';
import { HttpService } from '../../shared/http/http.service';
import { ConfigService } from '../../shared/config/config.service';
import { CloudType } from '../../types/config';
import { AxiosResponse } from 'axios';
@Controller()
export class OnedriveController {
  constructor(
    private dcService: DeploymentCenterService,
    private configService: ConfigService,
    private loggingService: LoggingService,
    private httpService: HttpService
  ) {}

  private config = this.configService.staticReactConfig;
  private envIsOnPrem = !!this.config.env && this.config.env.cloud === CloudType.onprem;
  private redirectUrl: string;

  @Get('auth/onedrive/authorize')
  async authorize(@Session() session, @Response() res, @Headers('host') host: string) {
    let stateKey = '';
    this.redirectUrl = `https://${host}/auth/onedrive/callback`;
    if (session) {
      stateKey = session[Constants.oauthApis.onedrive_state_key] = GUID.newGuid();
    } else {
      // Should be impossible to hit this
      this.loggingService.error({}, '', 'session-not-found');
      throw new HttpException('Session Not Found', 500);
    }

    res.redirect(
      `https://login.live.com/oauth20_authorize.srf?client_id=${this._getOnedriveClientId()}&scope=offline_access,onedrive.appfolder&response_type=code&redirect_uri=${this._getOnedriveRedirectUrl()}&state=${this.dcService
        .hashStateGuid(stateKey)
        .substr(0, 10)}`
    );
  }

  @Get('auth/onedrive/callback')
  callback() {
    return 'Successfully Authenticated. Redirecting...';
  }

  @Post('auth/onedrive/getToken')
  @HttpCode(200)
  async getToken(@Session() session, @Body('redirUrl') redirUrl: string, @Headers('origin') origin: string) {
    const state = this.dcService.getParameterByName('state', redirUrl);
    this.redirectUrl = `${origin}/auth/onedrive/callback`;
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
        `code=${code}&grant_type=authorization_code&redirect_uri=${this._getOnedriveRedirectUrl()}&client_id=${this._getOnedriveClientId()}&client_secret=${this._getOnedriveClientSecret()}`,
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

  @Get('api/onedrive/hasOnPremCredentials')
  @HttpCode(200)
  async hasOnPremCredentials() {
    return !!this._getOnedriveClientId() && !!this._getOnedriveClientSecret();
  }

  private _getOnedriveClientId() {
    if (this.envIsOnPrem) {
      return this.configService.get('DeploymentCenter_OnedriveClientId');
    }
    return this.configService.get('ONEDRIVE_CLIENT_ID');
  }

  private _getOnedriveClientSecret() {
    if (this.envIsOnPrem) {
      return this.configService.get('DeploymentCenter_OnedriveClientSecret');
    }
    return this.configService.get('ONEDRIVE_CLIENT_SECRET');
  }

  private _getOnedriveRedirectUrl() {
    if (this.envIsOnPrem && !!this.redirectUrl) {
      return this.redirectUrl;
    }
    return this.configService.get('ONEDRIVE_REDIRECT_URL');
  }
}
