import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '../shared/http/http.service';
import { ConfigService } from '../shared/config/config.service';
import { Constants } from '../constants';
import { SourceControlProvider } from '../types/source-control-provider';
import * as crypto from 'crypto';
import { LoggingService } from '../shared/logging/logging.service';

@Injectable()
export class DeploymentCenterService {
  constructor(private logService: LoggingService, private config: ConfigService, private httpService: HttpService) {}
  async getSourceControlAuthState(authToken) {
    try {
      const r = await this.httpService.get(
        `${this.config.get('ARM_ENDPOINT')}/providers/Microsoft.Web/sourcecontrols?api-version=${Constants.AntaresApiVersion}`,
        {
          headers: {
            Authorization: authToken,
          },
        }
      );

      const body = r.data;
      const providers: SourceControlProvider[] = body.value;
      const oneDriveObject = providers.find(x => x.name.toLowerCase() === 'onedrive');
      const bitbucketObject = providers.find(x => x.name.toLowerCase() === 'bitbucket');
      const dropboxObject = providers.find(x => x.name.toLowerCase() === 'dropbox');
      const githubObject = providers.find(x => x.name.toLowerCase() === 'github');
      return {
        github: !!githubObject && !!githubObject.properties && !!githubObject.properties.token,
        onedrive: !!oneDriveObject && !!oneDriveObject.properties && !!oneDriveObject.properties.token,
        bitbucket: !!bitbucketObject && !!bitbucketObject.properties && !!bitbucketObject.properties.token,
        dropbox: !!dropboxObject && !!dropboxObject.properties && !!dropboxObject.properties.token,
      };
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException('Internal Server Error', 501);
    }
  }

  async getSourceControlToken(aadToken: string, provider: string) {
    try {
      const r = await this.httpService.get(
        `${this.config.get('ARM_ENDPOINT')}/providers/Microsoft.Web/sourcecontrols/${provider}?api-version=${Constants.AntaresApiVersion}`,
        {
          headers: {
            Authorization: aadToken,
          },
        }
      );
      const body = r.data;
      if (body && body.properties && body.properties.token) {
        return { authenticated: true, token: body.properties.token };
      } else {
        this.logService.warn({}, `${provider}-passthrough-unauthorized`);
        throw new HttpException('Not Authorized', 401);
      }
    } catch (err) {
      if (err.response) {
        this.logService.warn({}, `${provider}-passthrough-failed-to-get-token`);
        throw new HttpException(err.response.data, err.response.status);
      }
      this.logService.warn({}, `${provider}-passthrough-unauthorized`);
      throw new HttpException('Not Authorized', 401);
    }
  }

  async saveToken(
    token: string,
    aadToken: string,
    provider: string,
    refreshToken: string = '',
    environment: string | null = null
  ): Promise<any> {
    const name = provider;
    return this.httpService.put(
      `${this.config.get('ARM_ENDPOINT')}/providers/Microsoft.Web/sourcecontrols/${provider}?api-version=${Constants.AntaresApiVersion}`,
      {
        name,
        properties: {
          token,
          refreshToken,
          environment,
          name,
        },
      },
      {
        headers: {
          Authorization: aadToken,
        },
      }
    );
  }

  getEnvironment(hostUrl: string) {
    switch (hostUrl.toLowerCase()) {
      case 'https://functions.azure.com':
        return 'Prod';
      case 'https://functions-next.azure.com':
        return 'Stage';
      case 'https://functions-release.azure.com':
        return 'Next';
      default:
        return null;
    }
  }

  getParameterByName(name: string, url: string): string {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results) {
      return '';
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  hashStateGuid(guid: string) {
    const hash = crypto.createHmac('sha256', process.env.SALT || '');
    hash.update(guid);
    return hash.digest('hex');
  }
}
