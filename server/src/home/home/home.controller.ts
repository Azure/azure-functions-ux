import { Controller, Get, Query, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { ConfigService } from '../../shared/config/config.service';
import { HomeService } from './home.service.base';

@Controller()
@UseInterceptors(CacheInterceptor)
export class HomeController {
  constructor(private configService: ConfigService, private homeService: HomeService) {}

  @Get('*')
  root(@Query('appsvc.clientoptimizations') optimized: string, @Query('appsvc.react') sendReact: boolean) {
    if (sendReact) {
      return this.homeService.getReactHomeHtml();
    }
    return this.homeService.getAngularHomeHtml(optimized);
  }
}
