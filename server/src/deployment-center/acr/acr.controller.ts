import { Controller, Post, Body, HttpException, HttpCode, Res } from '@nestjs/common';
import { HttpService } from '../../shared/http/http.service';

const acrHostSuffix = '.azurecr.io';

@Controller()
export class ACRController {
  constructor(private httpService: HttpService) {}

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
      const host = urlObj.host;
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
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }
}
