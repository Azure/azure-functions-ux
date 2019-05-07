import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ContainersService } from './containers.service';

@Controller('api')
export class ContainersController {
  constructor(private containerService: ContainersService) {}
  @Post('validateContainerImage')
  @HttpCode(200)
  validateContainerImage(@Body('url') proxyUrl: string, @Body('body') proxyBody: unknown, @Body('headers') proxyHeaders: unknown) {
    return this.containerService.validateContainerImage(proxyUrl, proxyBody, proxyHeaders);
  }
}
