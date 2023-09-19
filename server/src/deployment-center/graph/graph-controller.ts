import { Controller, Post, HttpException, HttpCode } from '@nestjs/common';
import { LoggingService } from '../../shared/logging/logging.service';
import { HttpService } from '../../shared/http/http.service';

@Controller()
export class GraphController {
  private readonly graphApiUrl = 'https://graph.microsoft.com';
  public static readonly GraphApiVersion = {
    V1: 'v1.0',
    Beta: 'beta',
  };

  constructor(private loggingService: LoggingService, private httpService: HttpService) {}

  @Post('api/graph/getUser')
  @HttpCode(200)
  async getUser(apiVersion = GraphController.GraphApiVersion.V1) {
    try {
      const url = `${this.graphApiUrl}/${apiVersion}/me`;
      const response = await this.httpService.get(url);
      if (response.data) {
        return response.data;
      } else {
        console.log(response);
      }
    } catch (e) {
      console.log(`Error caught: ${e}`);
      throw new HttpException(e, e);
    }
  }
}
