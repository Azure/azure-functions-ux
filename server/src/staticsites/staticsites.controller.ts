import { Controller, Post, Body, HttpException, Get, HttpCode, Res, Query, Param } from '@nestjs/common';
import { ConfigService } from '../shared/config/config.service';
import { HttpService } from '../shared/http/http.service';
import { Constants } from '../constants';
import { HttpUtil } from '../utilities/http.util';
import { getPortalEnvironmentDomain } from './staticsites';

@Controller('api/staticsites')
export class StaticSitesController {
  constructor(private configService: ConfigService, private httpService: HttpService) {}

  @Get('github/clientId')
  clientId() {
    return { client_id: this.configService.get('STATICSITES_GITHUB_CLIENT_ID') };
  }

  @Get('github/callback')
  async callback(@Res() res, @Query('code') code, @Query('state') state) {
    res.redirect(`https://${getPortalEnvironmentDomain()}/TokenAuthorize?code=${code}&state=${state}`);
  }

  @Get('github/callback/env/:env')
  async callbackRouter(@Res() res, @Query('code') code, @Query('state') state, @Param('env') env) {
    const envToUpper = (env && (env as string).toUpperCase()) || '';
    res.redirect(`https://${getPortalEnvironmentDomain(envToUpper)}/TokenAuthorize?code=${code}&state=${state}`);
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
