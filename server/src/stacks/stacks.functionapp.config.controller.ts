import { Controller, Get } from '@nestjs/common';
import { StacksFunctionAppConfigService } from './stacks.functionapp.config.service';

@Controller('api')
export class StacksFunctionAppConfigController {
  constructor(private _stackService: StacksFunctionAppConfigService) {}

  @Get('functionAppConfigStacks')
  functionAppConfigStacks() {
    return this._stackService.getStacks();
  }
}
