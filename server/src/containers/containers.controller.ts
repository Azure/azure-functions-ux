import { Controller, Post, Body } from '@nestjs/common';
import { ContainersService } from './containers.service';

@Controller('api')
export class ContainersController {
  constructor(private containerService: ContainersService) {}
  @Post('validateContainerImage')
  validateContainerImage(@Body('url') proxyUrl: string, @Body('body') proxyBody: unknown, @Body('headers') proxyHeaders: unknown) {
    return this.containerService.validateContainerImage(proxyUrl, proxyBody, proxyHeaders);
  }
}
