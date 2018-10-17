import axios from 'axios';
import { staticConfig } from '../config';
import * as crypto from 'crypto';
import { constants } from '../constants';
import { LogHelper } from '../logHelper';

export class oAuthHelper {
  constructor(private _provider: string) {}

  public async getToken(aadToken: string): Promise<any> {
    try {
      const r = await axios.get(
        `${staticConfig.config.env.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/${this._provider}?api-version=${
          constants.AntaresApiVersion
        }`,
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
        return { authenticated: false };
      }
    } catch (err) {
      LogHelper.error(`${this._provider}-get-token`, err);
      return { authenticated: false };
    }
  }

  public getParameterByName(name: string, url: string): string {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return '';
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  public getEnvironment(hostUrl: string) {
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

  public saveToken(token: string, aadToken: string, refreshToken: string = '', environment: string | null = null): Promise<any> {
    return axios.put(
      `${staticConfig.config.env.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/${this._provider}?api-version=${
        constants.AntaresApiVersion
      }`,
      {
        name: this._provider,
        properties: {
          name: this._provider,
          token: token,
          refreshToken: refreshToken,
          environment: environment,
        },
      },
      {
        headers: {
          Authorization: aadToken,
        },
      }
    );
  }

  public hashStateGuid(guid: string) {
    const hash = crypto.createHmac('sha256', process.env.SALT || '');
    hash.update(guid);
    return hash.digest('hex');
  }
}
