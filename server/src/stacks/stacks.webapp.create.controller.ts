import { Controller, Get } from '@nestjs/common';
import { StacksWebAppCreateService } from './stacks.webapp.create.service';

@Controller('api')
export class StacksWebAppCreateController {
  constructor(private _stackService: StacksWebAppCreateService) {}

  @Get('webAppCreateStacks')
  webAppCreateStacks() {
    return this._stackService.getStacks();
  }
}
