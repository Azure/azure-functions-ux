import { Controller, Get, Post, Query, HttpCode } from '@nestjs/common';
import { exists, readFile } from 'async-file';
import { normalize } from 'path';
import { ConfigService } from '../shared/config/config.service';
import { ResourcesService } from './resources/resources.service';

@Controller('api')
export class ApiController {
  constructor(private config: ConfigService, private resourcesService: ResourcesService) {}

  @Get('ping')
  @HttpCode(200)
  async ping() {
    // etodo: REMOVE
    // const reactHtmlFilePath = normalize('D:\\git\\azure-functions-ux\\client-react\\public\\index.html');
    // let newHtml: string;

    // if (await exists(reactHtmlFilePath)) {
    //   const html = await readFile(reactHtmlFilePath, { encoding: 'utf8' });
    //   const scriptTagRegex = /<script type="text\/javascript" id="appsvcConfig">(.*?)<\/script>/i;
    //   const scriptTagFormat = `<script type="text/javascript" id="appsvcConfig">{0}</script>`;

    //   try {
    //     // const regex = new RegExp(scriptTagRegex, 'U');
    //     const config = this.config.staticReactConfig;

    //     const configString = `window.appsvc = ${JSON.stringify(config)}`;
    //     const newScriptTagString = scriptTagFormat.replace('{0}', configString);
    //     newHtml = html.replace(scriptTagRegex, newScriptTagString);

    //     console.log(newHtml);
    //     // this._logService.trackEvent('React-Transform', { success: 'true', error: null });
    //   } catch (e) {
    //     // this._logService.trackEvent('React-Transform', { success: 'false', error: e });
    //     // this._logService.error('Failed to transform React index.html file', e);

    //     console.log(e);
    //     throw e;
    //   }
    // }

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
      hostName: this.config.get('WEBSITE_HOSTNAME'),
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
