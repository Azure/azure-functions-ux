import { Controller, Post, Body, Response } from '@nestjs/common';
import { HttpService } from '../shared/http/http.service';
import { LoggingService } from '../shared/logging/logging.service';

@Controller('api')
export class ProxyController {
  constructor(private loggingService: LoggingService, private httpService: HttpService) {}

  @Post('proxy')
  @Post('passthrough')
  async proxy(@Body('method') method, @Body('headers') headers, @Body('url') url, @Body('body') body, @Response() res) {
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
