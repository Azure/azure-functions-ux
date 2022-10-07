import { Controller, Post, Body, Res, HttpException } from '@nestjs/common';
import { HttpService } from '../shared/http/http.service';
import { LoggingService } from '../shared/logging/logging.service';
import { Response } from 'express';
import { Method } from 'axios';

export type KeyValue<T> = Record<string, T>;
export type WebJobData = {
  fileName: string;
  fileContent: string;
};

@Controller('api')
export class WebJobsController {
  constructor(private loggingService: LoggingService, private httpService: HttpService) {}

  @Post('uploadWebJobs')
  async uploadWebJobs(
    @Body('url') proxyUrl: string,
    @Body('data') data: WebJobData,
    @Body('authToken') authToken: string,
    @Res() res: Response
  ) {
    const { fileName, fileContent } = data;

    const byteString = atob(fileContent);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const content = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      content[i] = byteString.charCodeAt(i);
    }

    const headers: KeyValue<string> = {
      'Content-Disposition': `attachement; filename="${fileName}"`,
      'Content-Type': fileName.endsWith('.zip') ? 'application/zip' : 'application/octet-stream',
      'Cache-Control': 'no-cache',
      Authorization: authToken,
    };
    console.log(headers);
    return this.makeCall('PUT', headers, proxyUrl, content, res, ['application/zip', 'application/octet-stream']);
  }

  @Post('updateWebJobSetting')
  async updateWebJobSetting(
    @Body('url') proxyUrl: string,
    @Body('data') data: any,
    @Body('authToken') authToken: string,
    @Res() res: Response
  ) {
    const headers: KeyValue<string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Authorization: authToken,
    };

    return this.makeCall('PUT', headers, proxyUrl, data, res, ['application/json']);
  }

  private async makeCall(method: Method, headers: KeyValue<string>, url: string, body, res: Response, allowedContentType: string[]) {
    try {
      Object.keys(headers).forEach(key => {
        if (key.toLocaleLowerCase() === 'content-type') {
          const val = headers[key].toLocaleLowerCase();
          if (!allowedContentType.includes(val)) {
            throw new HttpException(`Content-type of ${val} is not accepted.`, 500);
          }
        }
      });

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
      if (!!err.response && !!err.status) {
        res.status(err.status).send(err.response);
      } else if (err.response) {
        res.status(err.response.status).send(err.response.data);
      } else {
        res.sendStatus(500);
      }
      this.loggingService.error('', err, 'proxy-webJobs');
    }
  }
}
