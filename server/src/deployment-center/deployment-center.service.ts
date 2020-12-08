import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '../shared/http/http.service';
import { ConfigService } from '../shared/config/config.service';
import { Constants } from '../constants';
import { SourceControlProvider } from '../types/source-control-provider';
import * as crypto from 'crypto';
import { LoggingService } from '../shared/logging/logging.service';
import { TokenData } from './deployment-center';
import { HttpUtil } from '../utilities/http.util';

@Injectable()
export class DeploymentCenterService {
  constructor(private logService: LoggingService, private config: ConfigService, private httpService: HttpService) {}

  async getSitePublishProfile(authToken: string, resourceId: string) {
    try {
      const url = `${this.config.get('ARM_ENDPOINT')}/${resourceId}/publishxml?api-version=${Constants.AntaresApiVersion20181101}`;
      const config = {
        headers: {
          Authorization: authToken,
        },
      };
      const r = await this.httpService.post(url, null, config);
      return r.data;
    } catch (err) {
      this.logService.error(`Failed to retrieve publish profile for '${resourceId}'.`);

      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException('Internal Server Error', 500);
    }
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

  getParameterByName(nameIn: string, url: string): string {
    return HttpUtil.getQueryParameterValue(nameIn, url);
  }
  hashStateGuid(guid: string) {
    const hash = crypto.createHmac('sha256', process.env.SALT || '');
    hash.update(guid);
    return hash.digest('hex');
  }
}
