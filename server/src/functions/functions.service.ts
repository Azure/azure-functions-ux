import { Injectable, HttpException, OnModuleInit } from '@nestjs/common';
import { join, normalize } from 'path';
import { readdir, exists, readFile } from 'async-file';
import * as fs from 'fs';
import { Constants } from '../constants';
import { KeyValue } from '../proxy/proxy.controller';
import { Url } from '../utilities/url.util';
import { HttpService } from '../shared/http/http.service';
import { Method } from 'axios';
import { Response } from 'express';
import { ConfigService } from '../shared/config/config.service';

export const urlParameterRegExp = /\{([^}]+)\}/g;

export interface NameValuePair {
  name: string;
  value: string;
}

@Injectable()
export class FunctionsService implements OnModuleInit {
  constructor(private httpService: HttpService, private configService: ConfigService) {}

  private templateMap: any = {};
  private bindingsMap: any = {};
  private quickStartMap: any = {};

  async onModuleInit() {
    await Promise.all([this.loadTemplateFiles(), this.loadBindingsFiles(), this.loadQuickStartFiles()]);
  }

  async getTemplates(runtime: string) {
    const runtimeVersion = runtime.replace('~', '');
    return this.templateMap[runtimeVersion] || this.templateMap.default;
  }

  async getBindings(runtime: string) {
    const runtimeVersion = runtime.replace('~', '');
    return this.bindingsMap[runtimeVersion] || this.bindingsMap.default;
  }

  async getQuickStart(fileName: string, language: string) {
    const langLower = language.toLowerCase();
    let langCode = 'en';
    if (langLower !== 'en') {
      if (Constants.quickstartLanguageMap[langLower]) {
        langCode = Constants.quickstartLanguageMap[langLower].toLowerCase();
      } else {
        langCode = langLower;
      }
    }
    let fileNameLower = `${fileName.toLowerCase()}${langCode !== 'en' ? `_${langCode}` : ''}`;

    if (this.quickStartMap[fileNameLower]) {
      return this.quickStartMap[fileNameLower];
    }
    /**
     * Check for the 'en' quickstart file if the specified langauge file is not available
     */
    if (langCode !== 'en') {
      fileNameLower = fileName.toLowerCase();
      if (this.quickStartMap[fileNameLower]) {
        return this.quickStartMap[fileNameLower];
      }
    }
    throw new HttpException(`${fileName} does not exist`, 404);
  }

  private async loadTemplateFiles() {
    const templateDir = normalize(join(__dirname, '..', 'data', 'templates'));
    if (!(await exists(templateDir))) {
      return;
    }
    const dirFiles = await readdir(templateDir);
    const loading = dirFiles.map(async file => {
      const contents = await readFile(join(templateDir, file), { encoding: 'utf8' });
      const runtime = file.replace('.json', '');
      this.templateMap[runtime] = JSON.parse(contents);
    });
    await loading;
  }

  private async loadBindingsFiles() {
    const bindingsDir = normalize(join(__dirname, '..', 'data', 'bindings'));
    if (!(await exists(bindingsDir))) {
      return;
    }
    const dirFiles = await readdir(bindingsDir);

    const loading = dirFiles.map(async file => {
      const contents = await readFile(join(bindingsDir, file), { encoding: 'utf8' });
      const runtime = file.replace('.json', '');
      this.bindingsMap[runtime] = JSON.parse(contents);
    });
    await loading;
  }

  private async loadQuickStartFiles() {
    const quickStartDir = normalize(join(__dirname, '..', 'quickstart'));
    if (!(await exists(quickStartDir))) {
      return;
    }
    this.readQuickstartDirectory(quickStartDir);
  }

  private async readQuickstartDirectory(dirPath: string) {
    const dirFiles = await readdir(dirPath);
    const loading = dirFiles.map(async file => {
      const filePath = join(dirPath, file);
      if (fs.existsSync(filePath)) {
        if (fs.lstatSync(filePath).isDirectory()) {
          this.readQuickstartDirectory(filePath);
        } else {
          const contents = await readFile(filePath, { encoding: 'utf8' });
          const fileName = file.replace('.md', '');
          this.quickStartMap[fileName.toLowerCase()] = contents;
        }
      }
    });
    await loading;
  }

  public async runFunction(
    resourceId: string,
    path: string,
    body: any,
    inputMethod: string,
    inputHeaders: NameValuePair[],
    authHeaders: KeyValue<string>,
    clientRequestId: string,
    functionKey: string,
    liveLogSessionId: string,
    res: Response
  ) {
    try {
      const armEndpoint = this.configService.armEndpoint;
      const getSiteUrl = `${armEndpoint}${resourceId}?api-version=${Constants.AntaresApiVersion20181101}`;
      const siteResponse = await this.httpService.get(getSiteUrl, {
        headers: authHeaders,
      });
      const site = siteResponse.data;
      if (site) {
        const url = `${Url.getMainUrl(site)}${path}`;
        const headers = {
          ...this._getHeaders(inputHeaders, liveLogSessionId, clientRequestId, functionKey),
          ...authHeaders,
        };

        const result = await this.httpService.request({
          method: inputMethod as Method,
          url: url,
          headers: headers,
          data: body,
        });

        if (result.headers) {
          Object.keys(result.headers).forEach(key => {
            res.setHeader(key, result.headers[key]);
          });
        }

        res.status(result.status).send(result.data);
      }
    } catch (err) {
      if (!!err.response && !!err.status) {
        res.status(err.status).send(err.response);
      } else if (err.response) {
        res.status(err.response.status).send(err.response.data);
      } else {
        res.sendStatus(500);
      }
    }
  }

  private _getHeaders(
    testHeaders: NameValuePair[],
    liveLogsSessionId: string,
    clientRequestId: string,
    functionKey: string
  ): KeyValue<string> {
    const headers = this._getJsonHeaders();
    testHeaders.forEach(h => {
      headers[h.name] = h.value;
    });

    if (functionKey) {
      headers['Cache-Control'] = 'no-cache';
      headers['x-functions-key'] = functionKey;
    }

    return {
      ...headers,
      ...{
        '#AzFuncLiveLogsSessionId': liveLogsSessionId,
        'x-ms-client-request-id': clientRequestId,
      },
    };
  }

  private _getJsonHeaders(): KeyValue<string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }
}
