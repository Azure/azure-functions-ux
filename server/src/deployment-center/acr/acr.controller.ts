import { Controller, Post, Body, HttpException, HttpCode, Res } from '@nestjs/common';
import { ConfigService } from '../../shared/config/config.service';
import { HttpService } from '../../shared/http/http.service';

@Controller()
export class ACRController {
  constructor(private httpService: HttpService, private configService: ConfigService) {}

  @Post('api/acr/getRepositories')
  @HttpCode(200)
  async getRepositories(
    @Body('loginServer') loginServer: string,
    @Body('encodedUserInfo') encodedUserInfo: string,
    @Res() res,
    @Body('last') last?
  ) {
    const url = !last ? `https://${loginServer}/v2/_catalog` : `https://${loginServer}/v2/_catalog?last=${last}&n=100&orderby=`;
    await this._makeGetCallWithLinkHeader(url, encodedUserInfo, res);
  }

  @Post('api/acr/getTags')
  @HttpCode(200)
  async getTags(
    @Body('loginServer') loginServer: string,
    @Body('repository') repository: string,
    @Body('encodedUserInfo') encodedUserInfo: string,
    @Res() res,
    @Body('last') last?
  ) {
    const url = !last
      ? `https://${loginServer}/v2/${repository}/tags/list`
      : `https://${loginServer}/v2/${repository}/tags/list?last=${last}&n=100&orderby=`;
    await this._makeGetCallWithLinkHeader(url, encodedUserInfo, res);
  }

  private _getACRAuthHeader(encodedUserInfo: string) {
    return {
      Authorization: `Basic ${encodedUserInfo}`,
    };
  }

  private async _makeGetCallWithLinkHeader(url: string, encodedUserInfo: string, res) {
    try {
      const urlObj = new URL(url);
      const host = urlObj.host?.toLowerCase();
      const acrHostSuffix = this.configService.acrSuffix.toLowerCase();
      if (!host.endsWith(acrHostSuffix)) {
        throw new HttpException('The url is not valid', 400);
      }
      const response = await this.httpService.get(url, {
        headers: this._getACRAuthHeader(encodedUserInfo),
      });

      if (response.headers.link) {
        res.setHeader('link', response.headers.link);
        res.setHeader('access-control-expose-headers', 'link');
      }
      res.json(response.data);
    } catch (err) {
      this.httpService.handleError(err);
    }
  }
}
