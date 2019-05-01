import { Controller, Post, Body } from '@nestjs/common';
import { ContainersService } from './containers.service';

@Controller('api')
export class ContainersController {
  constructor(private containerService: ContainersService) {}
  @Post('validateContainerImage')
  validateContainerImage(@Body('url') url: string, @Body('body') body: unknown, @Body('headers') headers: unknown) {
    return this.containerService.validateContainerImage(url, body, headers);
  }
}
