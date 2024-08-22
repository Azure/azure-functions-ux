import { Controller, Post, Body, HttpException, HttpCode, Res } from '@nestjs/common';
import { HttpService } from '../../shared/http/http.service';
import { GUID } from '../../utilities/guid';

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

  @Post('api/acr/getRoleAssignments')
  @HttpCode(200)
  async getRoleAssignments(
    @Body('armEndpoint') armEndpoint: string,
    @Body('armToken') armToken: string,
    @Body('apiVersion') apiVersion: string,
    @Body('scope') scope: string,
    @Body('principalId') principalId?: string
  ) {
    try {
      const urlString = `${armEndpoint}${scope}/providers/Microsoft.Authorization/roleAssignments?api-version=${apiVersion}`;
      const queryString = `&$filter=atScope()+and+assignedTo('{${principalId}}')`;
      const url = urlString + queryString;

      const r = await this.httpService.get(url, { headers: this._getARMAuthHeader(armToken) });
      if (r.data) {
        return r.data.value;
      }
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.statusText, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }

  @Post('api/acr/setRoleAssignment')
  @HttpCode(200)
  async setRoleAssignments(
    @Body('armEndpoint') armEndpoint: string,
    @Body('armToken') armToken: string,
    @Body('apiVersion') apiVersion: string,
    @Body('scope') scope: string,
    @Body('principalId') principalId: string,
    @Body('roleId') roleId: string
  ) {
    try {
      const roleGuid = GUID.newGuid();
      const urlString = `${armEndpoint}${scope}/providers/Microsoft.Authorization/roleAssignments/${roleGuid}?api-version=${apiVersion}`;
      const queryString = `&$filter=atScope()+and+assignedTo('{${principalId}}')`;
      const url = urlString + queryString;
      const data = {
        properties: {
          roleDefinitionId: `${scope}/providers/Microsoft.Authorization/roleDefinitions/${roleId}`,
          principalId: `${principalId}`,
        },
      };

      const r = await this.httpService.put(url, data, { headers: this._getARMAuthHeader(armToken) });
      if (r.data) {
        return r.data.value;
      }
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.statusText, err.response.status);
      }
      throw new HttpException(err, 500);
    }
  }

  private _getACRAuthHeader(encodedUserInfo: string) {
    return {
      Authorization: `Basic ${encodedUserInfo}`,
    };
  }

  private _getARMAuthHeader(armToken: string) {
    return {
      Authorization: `${armToken}`,
    };
  }

  private async _makeGetCallWithLinkHeader(url: string, encodedUserInfo: string, res) {
    try {
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
