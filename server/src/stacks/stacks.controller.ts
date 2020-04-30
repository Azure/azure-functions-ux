import { Controller, Query, HttpException, Post } from '@nestjs/common';
import { WebAppCreateStackVersionPlatform, WebAppCreateStackVersion, WebAppCreateStack } from './webapp/2020-05-01/stack.model';
import { ArrayUtil } from '../utilities/array.util';
import { FunctionAppAPIVersions } from './functionapp/versions';
import { WebAppAPIVersions } from './webapp/versions';
import { FunctionAppStacksService20200501 } from './functionapp/2020-05-01/stacks.service';
import { WebAppStacksService20200501 } from './webapp/2020-05-01/stacks.service';

@Controller('stacks')
export class StacksController {
  constructor(
    private _stackWebAppService20200501: WebAppStacksService20200501,
    private _stackFunctionAppService20200501: FunctionAppStacksService20200501
  ) {}

  @Post('webAppCreateStacks')
  webAppCreateStacks(@Query('api-version') apiVersion: string) {
    this._validateApiVersion(apiVersion, [WebAppAPIVersions['2020-05-01']]);

    if (apiVersion === WebAppAPIVersions['2020-05-01']) {
      return this._stackWebAppService20200501.getCreateStacks();
    }
  }

  @Post('webAppConfigStacks')
  webAppConfigStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    this._validateApiVersion(apiVersion, [WebAppAPIVersions['2020-05-01']]);
    this._validateOs(os);

    if (apiVersion === WebAppAPIVersions['2020-05-01']) {
      return this._stackWebAppService20200501.getConfigStacks(os);
    }
  }

  @Post('webAppGitHubActionStacks')
  webAppGitHubActionStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    this._validateApiVersion(apiVersion, [WebAppAPIVersions['2020-05-01']]);
    this._validateOs(os);

    if (apiVersion === WebAppAPIVersions['2020-05-01']) {
      return this._stackWebAppService20200501.getGitHubActionStacks(os);
    }
  }

  @Post('functionAppStacks')
  functionAppStacks(@Query('api-version') apiVersion: string) {
    this._validateApiVersion(apiVersion, [FunctionAppAPIVersions['2020-05-01']]);

    if (apiVersion === FunctionAppAPIVersions['2020-05-01']) {
      return this._stackFunctionAppService20200501.getStacks();
    }
  }

  private _validateOs(os?: 'linux' | 'windows') {
    if (os && os !== 'linux' && os !== 'windows') {
      throw new HttpException(`Incorrect os '${os}' provided. Allowed os values are 'linux' or 'windows'.`, 400);
    }
  }

  private _validateApiVersion(apiVersion: string, acceptedVersions: string[]) {
    if (!apiVersion) {
      throw new HttpException(`Missing 'api-version' query parameter. Allowed versions are: ${acceptedVersions.join(', ')}.`, 400);
    }

    if (!acceptedVersions.includes(apiVersion)) {
      throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed versions are: ${acceptedVersions.join(', ')}.`, 400);
    }
  }
}
