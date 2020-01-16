import { Controller, Get, Query, HttpException } from '@nestjs/common';
import { StacksFunctionAppConfigService } from './stacks.functionapp.config.service';
import { StacksFunctionAppCreateService } from './stacks.functionapp.create.service';
import { StacksWebAppConfigService } from './stacks.webapp.config.service';
import { StacksWebAppCreateService } from './stacks.webapp.create.service';

@Controller('api')
export class StacksController {
  constructor(
    private _stackFunctionAppConfigService: StacksFunctionAppConfigService,
    private _stackFunctionAppCreateService: StacksFunctionAppCreateService,
    private _stackWebAppConfigService: StacksWebAppConfigService,
    private _stackWebAppCreateService: StacksWebAppCreateService
  ) {}

  @Get('webAppCreateStacks')
  webAppCreateStacks(@Query('api-version') apiVersion: string) {
    if (apiVersion === 'v1') {
      return this._stackWebAppCreateService.getStacks();
    } else {
      throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed version is 'v1'.`, 400);
    }
  }

  @Get('webAppConfigStacks')
  webAppConfigStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    if (apiVersion === 'v1') {
      return this._stackWebAppConfigService.getStacks(os);
    } else {
      throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed version is 'v1'.`, 400);
    }
  }

  @Get('functionAppCreateStacks')
  functionAppCreateStacks(@Query('api-version') apiVersion: string) {
    if (apiVersion === 'v1') {
      return this._stackFunctionAppConfigService.getStacks();
    } else {
      throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed version is 'v1'.`, 400);
    }
  }

  @Get('functionAppConfigStacks')
  functionAppConfigStacks(@Query('api-version') apiVersion: string) {
    if (apiVersion === 'v1') {
      return this._stackFunctionAppCreateService.getStacks();
    } else {
      throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed version is 'v1'.`, 400);
    }
  }
}
