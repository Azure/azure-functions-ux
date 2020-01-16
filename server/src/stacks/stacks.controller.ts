import { Controller, Get, Query, HttpException, Post } from '@nestjs/common';
import { StacksFunctionAppConfigService } from './stacks.functionapp.config.service';
import { StacksFunctionAppCreateService } from './stacks.functionapp.create.service';
import { StacksWebAppConfigService } from './stacks.webapp.config.service';
import { StacksWebAppCreateService } from './stacks.webapp.create.service';

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
    if (apiVersion === 'v1') {
      return this._stackWebAppCreateService.getStacks();
    }
    throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed version is 'v1'.`, 400);
  }

  @Post('webAppConfigStacks')
  webAppConfigStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    if (apiVersion === 'v1') {
      return this._stackWebAppConfigService.getStacks(os);
    }
    throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed version is 'v1'.`, 400);
  }

  @Post('functionAppCreateStacks')
  functionAppCreateStacks(@Query('api-version') apiVersion: string) {
    if (apiVersion === 'v1') {
      return this._stackFunctionAppConfigService.getStacks();
    }
    throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed version is 'v1'.`, 400);
  }

  @Post('functionAppConfigStacks')
  functionAppConfigStacks(@Query('api-version') apiVersion: string) {
    if (apiVersion === 'v1') {
      return this._stackFunctionAppCreateService.getStacks();
    }
    throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed version is 'v1'.`, 400);
  }
}
