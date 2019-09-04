import { Injectable } from '@nestjs/common';
import { HomeService } from './home.service.base';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { Home } from './views/home';
import { ConfigService } from '../../shared/config/config.service';

@Injectable()
export class HomeServiceDev extends HomeService {
  constructor(private configService: ConfigService) {
    super();
  }

  getAngularHomeHtml = () => {
    const html = ReactDOMServer.renderToString(
      <Home
        {...this.configService.staticConfig}
        version={this.configService.get('VERSION')}
        versionConfig={null}
        clientOptimizationsOff={true}
      />
    );
    return `<!DOCTYPE html>\n${html}`;
  };

  getReactHomeHtml = () => {
    return 'Use https://localhost:44400 . React is not loaded from the server in dev mode.';
  };
}
