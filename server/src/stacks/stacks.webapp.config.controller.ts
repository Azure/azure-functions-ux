import { Controller, Get } from '@nestjs/common';
import { StacksWebAppConfigService } from './stacks.webapp.config.service';

@Controller('api')
export class StacksWebAppConfigController {
  constructor(private _stackService: StacksWebAppConfigService) {}

  @Get('webAppConfigStacks')
  webAppConfigStacks() {
    return this._stackService.getStacks();
  }
}
