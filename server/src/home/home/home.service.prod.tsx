import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../../shared/config/config.service';
import { normalize, join } from 'path';
import { exists, readFile } from 'async-file';
import { HomeService } from './home.service.base';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { Home } from './views/home';
import { EventType, LoggingService } from '../../shared/logging/logging.service';
@Injectable()
export class HomeServiceProd extends HomeService implements OnModuleInit {
  protected angularConfig: any = null;
  protected reactHtml: string = '';
  constructor(private _configService: ConfigService, private _logService: LoggingService) {
    super();
  }
  async onModuleInit() {
    const currentVersion = this._configService.get('VERSION');
    const configFileLoc = normalize(join(__dirname, '..', '..', 'public', 'ng-min', `${currentVersion}.json`));
    if (await exists(configFileLoc)) {
      const config = JSON.parse(await readFile(configFileLoc, { encoding: 'utf8' }));
      this.angularConfig = config;
    }

    await this._initializeReactHtml();
  }

  getAngularHomeHtml = (optimized?: string) => {
    const html = ReactDOMServer.renderToString(
      <Home
        {...this._configService.staticAngularConfig}
        version={this._configService.get('VERSION')}
        versionConfig={this.angularConfig}
        clientOptimizationsOff={!!(optimized && optimized.toLowerCase() === 'false')}
      />
    );
    return `<!DOCTYPE html>\n${html}`;
  };

  getReactHomeHtml = () => {
    return this.reactHtml;
  };

  // We need to add environment-specific settings by transforming the global config that gets injected into the
  // main index.html file which loads React.
  private async _initializeReactHtml() {
    const reactHtmlFilePath = normalize(join(__dirname, '..', '..', 'public', 'react', `index.react.html`));
    let newHtml: string;

    if (await exists(reactHtmlFilePath)) {
      const html = await readFile(reactHtmlFilePath, { encoding: 'utf8' });

      // I experimented with using XML parsers but it turns out that this was actually simpler and just as reliable for our limited use case.
      const scriptTagRegex = /<script type="text\/javascript" id="appsvcConfig">(.*?)<\/script>/i;
      const scriptTagFormat = `<script type="text/javascript" id="appsvcConfig">{0}</script>`;

      try {
        const configString = `window.appsvc = ${JSON.stringify(this._configService.staticReactConfig)}`;
        const newScriptTagString = scriptTagFormat.replace('{0}', configString);
        newHtml = html.replace(scriptTagRegex, newScriptTagString);
        this._logService.trackEvent('React-Transform', { success: 'true', error: null }, undefined, EventType.Error);
      } catch (e) {
        this._logService.trackEvent('React-Transform', { success: 'false', error: e }, undefined, EventType.Error);
        this._logService.error('Failed to transform React index.html file', e);

        throw e;
      }
    }
    this.reactHtml = newHtml;
  }
}
