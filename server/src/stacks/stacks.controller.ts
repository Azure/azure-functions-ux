import { Controller, Get, Query, HttpException, Post } from '@nestjs/common';
import { StacksFunctionAppConfigService } from './stacks.functionapp.config.service';
import { StacksFunctionAppCreateService } from './stacks.functionapp.create.service';
import { StacksWebAppConfigService } from './stacks.webapp.config.service';
import { StacksWebAppCreateService } from './stacks.webapp.create.service';
import { StackAPIVersions } from './stacks';

@Controller('stacks')
export class StacksController {
  constructor(
    private _stackFunctionAppConfigService: StacksFunctionAppConfigService,
    private _stackFunctionAppCreateService: StacksFunctionAppCreateService,
    private _stackWebAppConfigService: StacksWebAppConfigService,
    private _stackWebAppCreateService: StacksWebAppCreateService
  ) {}

  @Post('webAppCreateStacks')
  webAppCreateStacks(@Query('api-version') apiVersion: string) {
    this._validateApiVersion(apiVersion);

    if (apiVersion === StackAPIVersions.v1) {
      return this._stackWebAppCreateService.getStacks();
    }
  }

  @Post('webAppConfigStacks')
  webAppConfigStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    this._validateApiVersion(apiVersion);
    this._validateOs(os);

    if (apiVersion === StackAPIVersions.v1) {
      return this._stackWebAppConfigService.getStacks(os);
    }
  }

  @Post('functionAppCreateStacks')
  functionAppCreateStacks(@Query('api-version') apiVersion: string) {
    this._validateApiVersion(apiVersion);

    if (apiVersion === StackAPIVersions.v1) {
      return this._stackFunctionAppConfigService.getStacks();
    }
  }

  @Post('functionAppConfigStacks')
  functionAppConfigStacks(@Query('api-version') apiVersion: string) {
    this._validateApiVersion(apiVersion);

    if (apiVersion === StackAPIVersions.v1) {
      return this._stackFunctionAppCreateService.getStacks();
    }
  }

  private _validateOs(os?: 'linux' | 'windows') {
    if (os && os !== 'linux' && os !== 'windows') {
      throw new HttpException(`Incorrect os '${os}' provided. Allowed os values are 'linux' or 'windows'.`, 400);
    }
  }

  private _validateApiVersion(apiVersion) {
    if (!apiVersion) {
      throw new HttpException(`Missing 'api-version' query parameter. Allowed version is '${StackAPIVersions.v1}'.`, 400);
    }

    if (apiVersion !== StackAPIVersions.v1) {
      throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed version is '${StackAPIVersions.v1}'.`, 400);
    }
  }
}
