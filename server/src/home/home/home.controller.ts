import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '../../shared/config/config.service';
import { HomeService } from './home.service.base';

@Controller()
export class HomeController {
  constructor(private configService: ConfigService, private homeService: HomeService) {}

  @Get('*')
  root(
    @Res() res: Response,
    @Query('trustedAuthority') trustedAuthority: string,
    @Query('appsvc.devguide') devGuide: boolean,
    @Query('appsvc.clientoptimizations') optimized: boolean,
    @Query('appsvc.react') sendReact: boolean
  ) {
    if (!trustedAuthority && !devGuide && !sendReact) {
      res.redirect('https://azure.microsoft.com/services/functions/');
      return;
    }
    if (sendReact) {
      res.send(this.homeService.getReactHomeHtml());
      return;
    }
    res.render('index', {
      ...this.configService.staticConfig,
      version: this.configService.get('VERSION'),
      versionConfig: this.homeService.getAngularFileNames(null),
    });
  }
}
