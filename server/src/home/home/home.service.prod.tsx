import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../../shared/config/config.service';
import { normalize, join } from 'path';
import { exists, readFile } from 'async-file';
import { HomeService } from './home.service.base';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { Home } from './views/home';
@Injectable()
export class HomeServiceProd extends HomeService implements OnModuleInit {
  protected angularConfig: any = null;
  protected reactHtml: string = '';
  constructor(private configService: ConfigService) {
    super();
  }
  async onModuleInit() {
    const currentVersion = this.configService.get('VERSION');
    const configFileLoc = normalize(join(__dirname, '..', '..', 'public', 'ng-min', `${currentVersion}.json`));
    if (await exists(configFileLoc)) {
      const config = JSON.parse(await readFile(configFileLoc, { encoding: 'utf8' }));
      this.angularConfig = config;
    }
    const reactHtmlFile = normalize(join(__dirname, '..', '..', 'public', 'react', `index.react.html`));
    if (await exists(reactHtmlFile)) {
      const html = await readFile(reactHtmlFile, { encoding: 'utf8' });
      this.reactHtml = html;
    }
  }

  getAngularHomeHtml = (optimized?: string) => {
    const html = ReactDOMServer.renderToString(
      <Home
        {...this.configService.staticConfig}
        version={this.configService.get('VERSION')}
        versionConfig={this.angularConfig}
        clientOptimizationsOff={!!(optimized && optimized.toLowerCase() === 'false')}
      />
    );
    return `<!DOCTYPE html>\n${html}`;
  };

  getReactHomeHtml = () => {
    return this.reactHtml;
  };
}
