import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../../shared/config/config.service';
import { normalize, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { HomeService } from './home.service.base';
@Injectable()
export class HomeServiceProd extends HomeService implements OnModuleInit {
  protected angularConfig: any = {};
  protected reactHtml: string = '';
  constructor(private configService: ConfigService) {
    super();
  }
  async onModuleInit() {
    const currentVersion = this.configService.get('VERSION');
    const configFileLoc = normalize(join(__dirname, '..', '..', 'public', 'ng-min', `${currentVersion}.json`));
    if (existsSync(configFileLoc)) {
      const config = JSON.parse(readFileSync(configFileLoc, { encoding: 'UTF-8' }));
      this.angularConfig.latest = config;
      this.angularConfig[currentVersion] = config;
    }
    const reactHtmlFile = normalize(join(__dirname, '..', '..', 'public', 'react', `index.react.html`));
    if (existsSync(reactHtmlFile)) {
      const html = readFileSync(reactHtmlFile, { encoding: 'UTF-8' });
      this.reactHtml = html;
    }
  }
  getAngularFileNames = (version?: string) => {
    if (version) {
      return this.angularConfig[version] || this.angularConfig.latest;
    }
    return this.angularConfig.latest;
  };

  getReactHomeHtml = () => {
    return this.reactHtml;
  };
}
