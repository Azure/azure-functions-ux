import { Controller, Get, Post, Query } from '@nestjs/common';
import { ConfigService } from '../shared/config/config.service';
import { ResourcesService } from './resources/resources.service';

@Controller('api')
export class ApiController {
  constructor(private config: ConfigService, private resourcesService: ResourcesService) {}
  @Get('ping')
  async ping() {
    return 'success';
  }

  @Get('health')
  health() {
    return 'healthy';
  }

  @Get('version')
  version() {
    return this.config.get('VERSION');
  }

  @Get('debug')
  debug() {
    return {
      appName: this.config.get('WEBSITE_SITE_NAME') || 'DevMachine',
      version: this.config.get('VERSION'),
    };
  }

  @Get('resources')
  resources(@Query('runtime') runtime: string = 'default', @Query('name') name = 'en') {
    return this.resourcesService.getResources(runtime, name);
  }

  @Get('token')
  token() {
    return 'deprecated';
  }
}
