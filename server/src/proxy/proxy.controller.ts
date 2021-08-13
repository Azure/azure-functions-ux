import { Controller, Post, Body, Res } from '@nestjs/common';
import { HttpService } from '../shared/http/http.service';
import { LoggingService } from '../shared/logging/logging.service';
import { Response } from 'express';

@Controller('api')
export class ProxyController {
  constructor(private loggingService: LoggingService, private httpService: HttpService) {}

  @Post('proxy')
  async proxy(
    @Body('method') proxyMethod,
    @Body('headers') proxyHeaders,
    @Body('url') proxyUrl,
    @Body('body') proxyBody,
    @Res() res: Response
  ) {
    return this.makeCall(proxyMethod, proxyHeaders, proxyUrl, proxyBody, res);
  }

  @Post('passthrough')
  async passthrough(
    @Body('method') proxyMethod,
    @Body('headers') proxyHeaders,
    @Body('url') proxyUrl,
    @Body('body') proxyBody,
    @Res() res: Response
  ) {
    return this.makeCall(proxyMethod, proxyHeaders, proxyUrl, proxyBody, res);
  }

  private async makeCall(method: string, headers: any, url: string, body: any, res: Response) {
    try {
      const result = await this.httpService.request({
        method,
        url,
        headers,
        data: body,
      });

      if (result.headers) {
        Object.keys(result.headers).forEach(key => {
          res.setHeader(key, result.headers[key]);
        });
      }

      res.status(result.status).send(result.data);
    } catch (err) {
      if (err.response) {
        res.status(err.response.status).send(err.response.data);
      } else {
        res.sendStatus(500);
      }
      this.loggingService.error('', err, 'proxy-passthrough');
    }
  }
}
