import { Injectable, HttpException, OnModuleInit } from '@nestjs/common';
import { join, normalize } from 'path';
import { readdir, exists, readFile } from 'async-file';
import * as fs from 'fs';
import { Constants } from '../constants';
import { ArmObj } from '../types/arm-obj';
import { AppKeysInfo, BindingInfo, BindingType, FunctionInfo, UrlObj } from '../types/function-info';
import { KeyValue } from '../proxy/proxy.controller';
import { NetAjaxSettings } from '../types/ajax-request-model';
import { NameValuePair, Site } from '@azure/arm-appservice';
import { GUID } from '../utilities/guid';
import { Url } from '../utilities/url.util';
import { HttpService } from '../shared/http/http.service';
import { Method } from 'axios';
import { Response } from 'express';

export const urlParameterRegExp = /\{([^}]+)\}/g;

@Injectable()
export class FunctionsService implements OnModuleInit {
  constructor(private httpService: HttpService) {}

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
    functionInfo: ArmObj<FunctionInfo>,
    functionInvokePath: string,
    functionUrls: UrlObj[],
    hostUrls: UrlObj[],
    systemUrls: UrlObj[],
    authHeaders: KeyValue<string>,
    res: Response,
    hostKeys?: AppKeysInfo,
    functionKeys?: KeyValue<string>,
    xFunctionKey?: string
  ) {
    try {
      const url = `https://management.azure.com/${resourceId}?api-version=${Constants.AntaresApiVersion20181101}`;
      const siteResponse = await this.httpService.get(url, {
        headers: authHeaders,
      });
      const site = siteResponse.data;
      if (site) {
        const settings = this._getRunFunctionRequestSettings(
          site,
          functionInfo,
          functionInvokePath,
          functionUrls,
          hostUrls,
          systemUrls,
          hostKeys,
          functionKeys,
          xFunctionKey
        );
        const headers = {
          ...settings.headers,
          ...authHeaders,
        };

        const result = await this.httpService.request({
          method: settings.type as Method,
          url: settings.uri,
          headers: headers,
          data: settings.data,
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

  private _getRunFunctionRequestSettings(
    site: ArmObj<Site>,
    functionInfo: ArmObj<FunctionInfo>,
    functionInvokePath: string,
    functionUrls: UrlObj[],
    hostUrls: UrlObj[],
    systemUrls: UrlObj[],
    hostKeys?: AppKeysInfo,
    functionKeys?: KeyValue<string>,
    xFunctionKey?: string
  ) {
    const isHttpOrWebHookFunction = this._isHttpOrWebHookFunction(functionInfo);
    const liveLogsSessionId = GUID.newGuid();
    return isHttpOrWebHookFunction
      ? this._getSettingsToInvokeHttpFunction(
          site,
          functionInfo,
          functionInvokePath,
          functionUrls,
          hostUrls,
          hostKeys,
          xFunctionKey,
          liveLogsSessionId
        )
      : this._getSettingsToInvokeNonHttpFunction(
          site,
          functionInfo,
          functionUrls,
          hostUrls,
          systemUrls,
          hostKeys,
          functionKeys,
          xFunctionKey,
          liveLogsSessionId
        );
  }

  private _getSettingsToInvokeHttpFunction = (
    site: ArmObj<Site>,
    newFunctionInfo: ArmObj<FunctionInfo>,
    functionInvokePath: string,
    functionUrls: UrlObj[],
    hostUrls: UrlObj[],
    hostKeys?: AppKeysInfo,
    xFunctionKey?: string,
    liveLogsSessionId?: string
  ): NetAjaxSettings | undefined => {
    if (site) {
      let url = `${Url.getMainUrl(site)}${functionInvokePath}`;
      let parsedTestData = {};
      try {
        parsedTestData = JSON.parse(newFunctionInfo.properties.test_data);
      } catch (err) {
        parsedTestData = { body: newFunctionInfo.properties.test_data };
      }
      const testDataObject = this._getProcessedFunctionTestData(parsedTestData);
      const queries = testDataObject.queries;

      const matchesPathParams = url.match(urlParameterRegExp);
      const processedParams: string[] = [];
      if (matchesPathParams) {
        matchesPathParams.forEach(m => {
          const name = m
            .split(':')[0]
            .replace('{', '')
            .replace('}', '')
            .toLowerCase();
          processedParams.push(name);
          const param = queries.find(p => {
            return p.name.toLowerCase() === name;
          });

          if (param) {
            url = url.replace(m, param.value);
          }
        });
      }

      const filteredQueryParams = queries.filter(query => {
        return !processedParams.find(p => p === query.name);
      });
      const queryString = this._getQueryString(filteredQueryParams);
      if (queryString) {
        url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }
      const headers = this._getHeaders(testDataObject.headers, functionUrls, hostUrls, hostKeys, xFunctionKey);

      return {
        uri: url,
        type: testDataObject.method as string,
        headers: { ...headers, ...this._getHeadersForLiveLogsSessionId(liveLogsSessionId) },
        data: testDataObject.body,
      };
    }
    return undefined;
  };

  private _getSettingsToInvokeNonHttpFunction = (
    site: ArmObj<Site>,
    newFunctionInfo: ArmObj<FunctionInfo>,
    functionUrls: UrlObj[],
    hostUrls: UrlObj[],
    systemUrls: UrlObj[],
    hostKeys?: AppKeysInfo,
    functionKeys?: KeyValue<string>,
    xFunctionKey?: string,
    liveLogsSessionId?: string
  ): NetAjaxSettings | undefined => {
    if (site) {
      const baseUrl = Url.getMainUrl(site);
      const input = newFunctionInfo.properties.test_data || '';

      let data: unknown = { input };
      let url = `${baseUrl}/admin/functions/${newFunctionInfo.properties.name.toLowerCase()}`;
      if (this._getAuthenticationEventsTriggerTypeInfo(newFunctionInfo.properties)) {
        try {
          data = JSON.parse(input);
        } catch {
          /** @note (joechung): Treat invalid JSON as string input. */
        }

        const functionKey = xFunctionKey ?? functionKeys?.default;
        const code = [...functionUrls, ...hostUrls, ...systemUrls].find(urlObj => urlObj.key === functionKey)?.data;
        url = this._getAuthenticationTriggerUrl(baseUrl, newFunctionInfo, code);
      }

      const headers = this._getHeaders([], functionUrls, hostUrls, hostKeys, xFunctionKey);

      return {
        uri: url,
        type: 'POST',
        headers: { ...headers, ...this._getHeadersForLiveLogsSessionId(liveLogsSessionId) },
        data,
      };
    }
    return undefined;
  };

  private _getHeadersForLiveLogsSessionId(liveLogsSessionId?: string) {
    return { '#AzFuncLiveLogsSessionId': liveLogsSessionId || '' };
  }

  private _getAuthenticationEventsTriggerTypeInfo(functionInfo: FunctionInfo): BindingInfo | undefined {
    return functionInfo.config?.bindings.find(e => this._isBindingTypeEqual(e.type, BindingType.authenticationEventsTrigger));
  }

  private _getAuthenticationTriggerUrl(baseUrl: string, functionInfo: ArmObj<FunctionInfo>, code: string) {
    return `${baseUrl}/runtime/webhooks/customauthenticationextension?functionName=${functionInfo.properties.name}&code=${code}`;
  }

  private _getProcessedFunctionTestData(data: any) {
    const response = {
      method: 'get',
      queries: [] as NameValuePair[],
      headers: [] as NameValuePair[],
      body: '',
    };
    if (data.method) {
      response.method = data.method;
    }
    if (data.queryStringParams) {
      const queries: NameValuePair[] = [];
      for (const parameter of data.queryStringParams) {
        queries.push({ name: parameter.name, value: parameter.value });
      }
      response.queries = queries;
    }
    if (data.headers) {
      const headers: NameValuePair[] = [];
      for (const parameter of data.headers) {
        headers.push({ name: parameter.name, value: parameter.value });
      }
      response.headers = headers;
    }
    if (data.body) {
      response.body = data.body;
    }
    return response;
  }

  private _getQueryString(queries: NameValuePair[]): string {
    const queryString = queries.map(query => `${encodeURIComponent(query.name)}=${encodeURIComponent(query.value)}`);
    return queryString.join('&');
  }

  private _getHeaders(
    testHeaders: NameValuePair[],
    functionUrls: UrlObj[],
    hostUrls: UrlObj[],
    hostKeys?: AppKeysInfo,
    xFunctionKey?: string
  ): KeyValue<string> {
    const headers = this._getJsonHeaders();
    testHeaders.forEach(h => {
      headers[h.name] = h.value;
    });

    if (hostKeys && hostKeys.masterKey) {
      headers['Cache-Control'] = 'no-cache';
      headers['x-functions-key'] = xFunctionKey ? this._getXFunctionKeyValue(xFunctionKey, functionUrls, hostUrls) : hostKeys.masterKey;
    }
    return headers;
  }

  private _getJsonHeaders(): KeyValue<string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-ms-client-request-id': GUID.newGuid(),
    };
  }

  private _isHttpOrWebHookFunction(functionInfo: ArmObj<FunctionInfo>) {
    return (
      functionInfo.properties.config?.bindings?.some(e => e.type.toString().toLowerCase() === BindingType.httpTrigger.toLowerCase()) ||
      functionInfo.properties.config?.bindings?.some(e => !!e.webHookType)
    );
  }

  private _isBindingTypeEqual(bindingType1: BindingType | string, bindingType2: BindingType | string) {
    return bindingType1.toString().toLowerCase() === bindingType2.toString().toLowerCase();
  }

  private _getXFunctionKeyValue(xFunctionKey: string, functionUrls: UrlObj[], hostUrls: UrlObj[]) {
    for (const url in functionUrls) {
      if (url in functionUrls && functionUrls[url].key === xFunctionKey) {
        return functionUrls[url].data as string;
      }
    }
    for (const url in hostUrls) {
      if (url in hostUrls && hostUrls[url].key === xFunctionKey) {
        return hostUrls[url].data as string;
      }
    }
    return '';
  }
}
