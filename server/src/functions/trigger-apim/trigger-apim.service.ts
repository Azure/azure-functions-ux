import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '../../shared/config/config.service';
import { HttpService } from '../../shared/http/http.service';
interface TriggerRequest {
  body: string;
  url: string;
}
@Injectable()
export class TriggerApimService {
  constructor(private configService: ConfigService, private httpService: HttpService) {}

  async triggerFunctionAPIM(content: TriggerRequest) {
    if (!this.configService.get('APIMSubscriptionKey')) {
      throw new HttpException('APIMSubscriptionKey is not defined', 500);
    }

    const headers: { [key: string]: string } = {};
    headers['Content-Type'] = 'application/json';
    headers.Accept = 'application/json';
    headers['Cache-Control'] = 'no-cache';
    headers['Ocp-Apim-Subscription-Key'] = process.env.APIMSubscriptionKey;
    headers['Ocp-Apim-Trace'] = 'true';

    const request = {
      method: 'POST',
      data: content.body,
      headers,
      url: content.url,
    };

    try {
      return await this.httpService.request(request).then(r => r.data);
    } catch (e) {
      if (e.response && e.response.status) {
        let message = e.message;
        if (e.response.data) {
          message = e.response.data;
        }
        throw new HttpException(message, e.response.status);
      } else if (e.request) {
        throw new HttpException(
          {
            reason: 'TriggerError',
            error: 'request error',
          },
          400
        );
      } else {
        throw new HttpException(
          {
            reason: 'TriggerError',
            error: e.code,
          },
          e.code
        );
      }
    }
  }
}
