import { Controller, Post, Body, HttpException, HttpCode, Res } from '@nestjs/common';
import { HttpService } from '../../shared/http/http.service';

@Controller()
export class ACRController {
  constructor(private httpService: HttpService) {}

  @Post('api/acr/getRepositories')
  @HttpCode(200)
  async getRepositories(
    @Body('loginServer') loginServer: string,
    @Body('encodedUserInfo') encodedUserInfo: string,
    @Body('page') page: number,
    @Res() res
  ) {
    const url = `https://${loginServer}/v2/_catalog?page=${page}`;
    await this._makeGetCallWithLinkHeader(url, encodedUserInfo, res);
  }

  @Post('api/acr/getTags')
  @HttpCode(200)
  async getTags(
    @Body('loginServer') loginServer: string,
    @Body('repository') repository: string,
    @Body('encodedUserInfo') encodedUserInfo: string,
    @Body('page') page: number,
    @Res() res
  ) {
    const url = `https://${loginServer}/v2/${repository}/tags/list?page=${page}`;
    await this._makeGetCallWithLinkHeader(url, encodedUserInfo, res);
  }

  private _getACRAuthHeader(encodedUserInfo: string) {
    return {
      Authorization: `Basic ${encodedUserInfo}`,
    };
  }

  private async _makeGetCallWithLinkHeader(url: string, encodedUserInfo: string, res: any) {
    try {
      const response = await this.httpService.get(url, {
        headers: this._getACRAuthHeader(encodedUserInfo),
      });

      if (response.headers.link) {
        res.setHeader('link', response.headers.link);
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
