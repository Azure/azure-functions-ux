import { Controller, Get, Query, HttpException } from '@nestjs/common';
import { StacksFunctionAppConfigService } from './stacks.functionapp.config.service';
import { StacksFunctionAppCreateService } from './stacks.functionapp.create.service';
import { StacksWebAppConfigService } from './stacks.webapp.config.service';
import { StacksWebAppCreateService } from './stacks.webapp.create.service';
import { AppType, BladeType } from './stacks';

@Controller('api')
export class StacksController {
  constructor(
    private _stackFunctionAppConfigService: StacksFunctionAppConfigService,
    private _stackFunctionAppCreateService: StacksFunctionAppCreateService,
    private _stackWebAppConfigService: StacksWebAppConfigService,
    private _stackWebAppCreateService: StacksWebAppCreateService
  ) {}

  @Get('stacks')
  stacks(@Query('appType') appType: AppType, @Query('blade') bladeType: BladeType) {
    if (appType === 'WebApp' && bladeType === 'Create') {
      return this._getWebAppCreateStacks();
    } else if (appType === 'WebApp' && bladeType === 'Config') {
      return this._getWebAppConfigStacks();
    } else if (appType === 'FunctionApp' && bladeType === 'Create') {
      return this._getFunctionAppCreateStacks();
    } else if (appType === 'FunctionApp' && bladeType === 'Config') {
      return this._getFunctionAppConfigStacks();
    }

    throw new HttpException(`AppType of '${appType}' and blade name '${bladeType}' are not allowed`, 400);
  }

  private _getFunctionAppConfigStacks() {
    return this._stackFunctionAppConfigService.getStacks();
  }

  private _getFunctionAppCreateStacks() {
    return this._stackFunctionAppCreateService.getStacks();
  }

  private _getWebAppConfigStacks() {
    return this._stackWebAppConfigService.getStacks();
  }

  private _getWebAppCreateStacks() {
    return this._stackWebAppCreateService.getStacks();
  }
}
