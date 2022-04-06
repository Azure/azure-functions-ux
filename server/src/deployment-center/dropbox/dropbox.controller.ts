import { Controller, Post, Body, HttpException, Get, Session, HttpCode, Response } from '@nestjs/common';
import { DeploymentCenterService } from '../deployment-center.service';
import { ConfigService } from '../../shared/config/config.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { Constants } from '../../constants';
import { GUID } from '../../utilities/guid';
import { HttpService } from '../../shared/http/http.service';
import { CloudType } from '../../types/config';
import { AxiosResponse } from 'axios';

@Controller()
export class DropboxController {
  private readonly provider = 'dropbox';
  constructor(
    private dcService: DeploymentCenterService,
    private configService: ConfigService,
    private loggingService: LoggingService,
    private httpService: HttpService
  ) {}

  private config = this.configService.staticReactConfig;
  private envIsOnPrem = !!this.config.env && this.config.env.cloud === CloudType.onprem;
  private redirectUrl: string;

  @Get('auth/dropbox/redirectUrl')
  @HttpCode(200)
  async setRedirectUrl(@Body('authCallbackUrl') redirUrl?: string) {
    this.redirectUrl = redirUrl;
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

    if (this.envIsOnPrem && !!this.redirectUrl) {
      res.redirect(
        `https://dropbox.com/oauth2/authorize?client_id=${this._getDropboxClientId()}&redirect_uri=${
          this.redirectUrl
        }&response_type=code&state=${this.dcService.hashStateGuid(stateKey).substr(0, 10)}`
      );
    } else {
      res.redirect(
        `https://dropbox.com/oauth2/authorize?client_id=${this._getDropboxClientId()}&redirect_uri=${this._getDropboxRedirectUrl()}&response_type=code&state=${this.dcService
          .hashStateGuid(stateKey)
          .substr(0, 10)}`
      );
    }
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
      let r: AxiosResponse;
      if (this.envIsOnPrem) {
        r = await this.httpService.post<{ access_token: string }>(
          'https://api.dropbox.com/oauth2/token',
          `code=${code}&grant_type=authorization_code&redirect_uri=${redirUrl}&client_id=${this._getDropboxClientId()}&client_secret=${this._getDropboxClientSecret()}`,
          {
            headers: {
              'Content-type': 'application/x-www-form-urlencoded',
            },
          }
        );
      } else {
        r = await this.httpService.post<{ access_token: string }>(
          'https://api.dropbox.com/oauth2/token',
          `code=${code}&grant_type=authorization_code&redirect_uri=${this._getDropboxRedirectUrl()}&client_id=${this._getDropboxClientId()}&client_secret=${this._getDropboxClientSecret()}`,
          {
            headers: {
              'Content-type': 'application/x-www-form-urlencoded',
            },
          }
        );
      }

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

  @Get('auth/dropbox/hasOnPremCredentials')
  @HttpCode(200)
  async hasOnPremCredentials() {
    // TODO: FIX KEY VALUE FOR CLIENT SECRET
    return !!this._getDropboxClientId() && !!this._getDropboxClientSecret();
  }

  private _getDropboxClientId() {
    if (this.envIsOnPrem) {
      return this.configService.get('DeploymentCenter_DropboxClientId');
    }
    return this.configService.get('DROPBOX_CLIENT_ID');
  }

  private _getDropboxClientSecret() {
    if (this.envIsOnPrem) {
      // TODO: FIX KEY VALUE FOR CLIENT SECRET
      return this.configService.get('DeploymentCenter_DropboxClinetSecret');
    }
    return this.configService.get('DROPBOX_CLIENT_SECRET');
  }

  private _getDropboxRedirectUrl() {
    return this.configService.get('DROPBOX_REDIRECT_URL');
  }
}
