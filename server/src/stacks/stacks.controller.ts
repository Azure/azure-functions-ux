import { Controller, Get, Query, HttpException } from '@nestjs/common';
import { StacksFunctionAppConfigService } from './stacks.functionapp.config.service';
import { StacksFunctionAppCreateService } from './stacks.functionapp.create.service';
import { StacksWebAppConfigService } from './stacks.webapp.config.service';
import { StacksWebAppCreateService } from './stacks.webapp.create.service';
import { AppType, Blade } from './stacks';

@Controller('api')
export class StacksController {
  constructor(
    private _stackFunctionAppConfigService: StacksFunctionAppConfigService,
    private _stackFunctionAppCrateService: StacksFunctionAppCreateService,
    private _stackWebAppConfigService: StacksWebAppConfigService,
    private _stackWebAppCreateService: StacksWebAppCreateService
  ) {}

  @Get('stacks')
  stacks(@Query('appType') appType: AppType, @Query('blade') blade: Blade) {
    if (appType === 'WebApp' && blade === 'Create') {
    } else if (appType === 'WebApp' && blade === 'Config') {
    } else if (appType === 'FunctionApp' && blade === 'Create') {
    } else if (appType === 'FunctionApp' && blade === 'Config') {
    }

    throw new HttpException('Header must contain Storage Connection Container Name', 400);
  }

  private _getFunctionAppConfigStacks() {}

  private _getFunctionAppCreateStacks() {}

  private _getWebAppConfigStacks() {}

  private _getWebAppCrateStacks() {}
}
