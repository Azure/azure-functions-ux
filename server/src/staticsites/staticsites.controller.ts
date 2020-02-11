import { Controller, Post, Body, HttpException, Response, Get, Session, HttpCode, Res, Put } from '@nestjs/common';
import { ConfigService } from '../shared/config/config.service';
import { HttpService } from '../shared/http/http.service';
import { Constants } from '../constants';
import { HttpUtil } from '../utilities/http.util';

@Controller('api/staticsites')
export class StaticSitesController {
  constructor(private configService: ConfigService, private httpService: HttpService) {}

  @Get('github/clientId')
  clientId() {
    return { client_id: this.configService.get('STATICSITES_GITHUB_CLIENT_ID') };
  }

  @Post('github/generateAccessToken')
  @HttpCode(200)
  async generateAccessToken(@Body('code') code: string, @Body('state') state: string) {
    try {
      const response = await this.httpService.post(`${Constants.oauthApis.githubApiUri}/access_token`, {
        code,
        state,
        client_id: this.configService.get('STATICSITES_GITHUB_CLIENT_ID'),
        client_secret: this.configService.get('STATICSITES_GITHUB_CLIENT_SECRET'),
      });

      const accessToken = HttpUtil.getQueryParameterValue('access_token', `?${response.data}`);
      return { access_token: accessToken };
    } catch (err) {
      throw new HttpException(err, 500);
    }
  }
}
