import { Controller, Get } from '@nestjs/common';
import { StacksFunctionAppCreateService } from './stacks.functionapp.create.service';

@Controller('api')
export class StacksFunctionAppCreateController {
  constructor(private _stackService: StacksFunctionAppCreateService) {}

  @Get('functionAppCreateStacks')
  functionAppCreateStacks() {
    return this._stackService.getStacks();
  }
}
