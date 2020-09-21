import { Controller, Get, Post, Query, HttpCode } from '@nestjs/common';
import { exists, readFile } from 'async-file';
import { join, normalize } from 'path';
import { Builder, parseString, parseStringPromise } from 'xml2js';
import { ConfigService } from '../shared/config/config.service';
import { ResourcesService } from './resources/resources.service';

@Controller('api')
export class ApiController {
  constructor(private config: ConfigService, private resourcesService: ResourcesService) {}

  @Get('ping')
  @HttpCode(200)
  async ping() {
    // etodo: REMOVE
    // const reactHtmlFile = normalize('D:\\git\\azure-functions-ux\\client-react\\public\\index.html');
    // if (await exists(reactHtmlFile)) {
    //   const html = await readFile(reactHtmlFile, { encoding: 'utf8' });

    //   const scriptTagFormat = `<script type="text\/javascript" id='appsvcConfig'>{0}<\/script>`;

    //   try {
    //     const regex = new RegExp(scriptTagFormat.replace('{0}', '.*'), 'gis');
    //     const config = this.config.staticReactConfig;

    //     const configString = `window.appsvc = ${JSON.stringify(config)}`;
    //     const scriptTagString = scriptTagFormat.replace('{0}', configString);
    //     const newHtml = html.replace(regex, scriptTagString);
    //     console.log(newHtml);

    //   } catch (e) {
    //     console.log(e);
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
