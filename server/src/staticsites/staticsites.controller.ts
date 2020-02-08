import { Controller, Post, Body, HttpException, Response, Get, Session, HttpCode, Res, Put } from '@nestjs/common';
import { ConfigService } from '../shared/config/config.service';
import { HttpService } from '../shared/http/http.service';
import { Constants } from '../constants';

@Controller('api')
export class StaticSitesController {
  constructor(private configService: ConfigService, private httpService: HttpService) {}

  @Post('github/generateAccessToken')
  @HttpCode(200)
  async generateAccessToken(@Body('code') code: string, @Body('state') state: string, @Res() res) {
    try {
      const response = await this.httpService.post(`${Constants.oauthApis.githubApiUri}/access_token`, {
        code,
        state,
        client_id: this.configService.get('STATICSITES_GITHUB_CLIENT_ID'),
        client_secret: this.configService.get('STATICSITES_GITHUB_CLIENT_SECRET'),
      });

      res.json(response.data);
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }
}
