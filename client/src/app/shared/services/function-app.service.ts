import { GlobalStateService } from './global-state.service';
import { Host } from './../models/host';
import { HttpMethods, HttpConstants, LogCategories, ContainerConstants } from './../models/constants';
import { UserService } from './user.service';
import { HostingEnvironment } from './../models/arm/hosting-environment';
import { FunctionAppContext } from './../function-app-context';
import { CacheService } from 'app/shared/services/cache.service';
import { Injectable, Injector } from '@angular/core';
import { Headers, Response, ResponseType, ResponseContentType } from '@angular/http';
import { FunctionInfo } from 'app/shared/models/function-info';
import { HttpResult } from './../models/http-result';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { FunctionsVersionInfoHelper } from 'app/shared/models/functions-version-info';
import { Constants } from 'app/shared/models/constants';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/zip';
import { ApiProxy } from 'app/shared/models/api-proxy';
import * as jsonschema from 'jsonschema';
import { VfsObject } from 'app/shared/models/vfs-object';
import { FunctionTemplate } from 'app/shared/models/function-template';
import { HttpRunModel, Param } from 'app/shared/models/http-run';
import { FunctionKeys, FunctionKey } from 'app/shared/models/function-key';
import { BindingConfig, RuntimeExtension } from 'app/shared/models/binding';
import { HostStatus } from 'app/shared/models/host-status';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { FunctionAppEditMode } from 'app/shared/models/function-app-edit-mode';
import { Site } from 'app/shared/models/arm/site';
import { AuthSettings } from 'app/shared/models/auth-settings';
import { RunFunctionResult } from 'app/shared/models/run-function-result';
import { PortalResources } from 'app/shared/models/portal-resources';
import { ConditionalHttpClient } from 'app/shared/conditional-http-client';
import { TranslateService } from '@ngx-translate/core';
import { errorIds } from 'app/shared/models/error-ids';
import { LogService } from './log.service';
import { PortalService } from 'app/shared/services/portal.service';
import { ExtensionInstallStatus } from '../models/extension-install-status';
import { Templates } from './../../function/embedded/temp-templates';
import { SiteService } from './site.service';
import { ExtensionJobsStatus } from '../models/extension-jobs-status';
import { ExtensionInfo, ExtensionsJson } from 'app/shared/models/extension-info';
import { Version } from 'app/shared/Utilities/version';
import { ApplicationSettings } from 'app/shared/models/arm/application-settings';
import { ArmSiteDescriptor } from '../resourceDescriptors';

type Result<T> = Observable<HttpResult<T>>;
@Injectable()
export class FunctionAppService {
  private readonly runtime: ConditionalHttpClient;
  private readonly azure: ConditionalHttpClient;
  private readonly _embeddedTemplates: Templates;

  constructor(
    private _cacheService: CacheService,
    private _translateService: TranslateService,
    private _userService: UserService,
    private _injector: Injector,
    private _portalService: PortalService,
    private _globalStateService: GlobalStateService,
    private _siteService: SiteService,
    private _logService: LogService,
    injector: Injector
  ) {
    this.runtime = new ConditionalHttpClient(
      injector,
      resourceId => this.getRuntimeToken(resourceId),
      'NoClientCertificate',
      'NotOverQuota',
      'NotStopped',
      'ReachableLoadballancer'
    );
    this.azure = new ConditionalHttpClient(
      injector,
      _ => _userService.getStartupInfo().map(i => i.token),
      'NotOverQuota',
      'ReachableLoadballancer'
    );
    this._embeddedTemplates = new Templates();
  }

  private getRuntimeToken(resourceId: string): Observable<string> {
    let context: FunctionAppContext;

    return this.getAppContext(resourceId)
      .concatMap(c => {
        context = c;
        return this._userService.getStartupInfo();
      })
      .concatMap(info => {
        if (ArmUtil.isLinuxDynamic(context.site)) {
          return this._cacheService.getArm(`${context.site.id}/hostruntime/admin/host/systemkeys/_master`);
        } else if (ArmUtil.isLinuxApp(context.site)) {
          return this._cacheService.get(
            Constants.serviceHost + `api/runtimetoken${context.site.id}`,
            false,
            this.portalHeaders(info.token)
          );
        } else {
          return this._cacheService.get(context.urlTemplates.scmTokenUrl, false, this.headers(info.token));
        }
      })
      .map(r => {
        const value: string | FunctionKey = r.json();
        return typeof value === 'string' ? value : `masterKey ${value.value}`;
      });
  }

  getClient(context: FunctionAppContext) {
    return ArmUtil.isLinuxApp(context.site) ? this.runtime : this.azure;
  }

  getFunction(context: FunctionAppContext, name: string): Result<FunctionInfo> {
    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      Observable.zip(
        this._cacheService.get(context.urlTemplates.getFunctionUrl(name), false, this.headers(t)),
        this._siteService.getAppSettings(context.site.id, true),
        (functions, appSettings) => ({
          function: functions.json() as FunctionInfo,
          appSettings: appSettings.result,
        })
      ).map(result => {
        // For runtime 2.0 we use settings for disabling functions
        const appSettings = result.appSettings as ArmObj<{ [key: string]: string }>;
        if (FunctionsVersionInfoHelper.getFunctionGeneration(appSettings.properties[Constants.runtimeVersionAppSettingName]) === 'V2') {
          const disabledSetting = appSettings.properties[`AzureWebJobs.${result.function.name}.Disabled`];
          result.function.config.disabled = disabledSetting && disabledSetting.toLocaleLowerCase() === 'true';
        }
        return result.function;
      })
    );
  }

  getFunctions(context: FunctionAppContext): Result<FunctionInfo[]> {
    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      Observable.zip(
        this._cacheService.get(context.urlTemplates.functionsUrl, false, this.headers(t)),
        this._cacheService.postArm(`${context.site.id}/config/appsettings/list`),
        (functions, appSettings) => ({ functions: functions.json() as FunctionInfo[], appSettings: appSettings.json() })
      ).map(result => {
        // For runtime 2.0 we use settings for disabling functions
        const appSettings = result.appSettings as ArmObj<{ [key: string]: string }>;
        if (FunctionsVersionInfoHelper.getFunctionGeneration(appSettings.properties[Constants.runtimeVersionAppSettingName]) === 'V2') {
          result.functions.forEach(f => {
            const disabledSetting = appSettings.properties[`AzureWebJobs.${f.name}.Disabled`];

            // Config doesn't exist for embedded
            if (f.config) {
              f.config.disabled = disabledSetting && disabledSetting.toLocaleLowerCase() === 'true';
            }
          });
        }
        return result.functions;
      })
    );
  }

  getApiProxies(context: FunctionAppContext): Result<ApiProxy[]> {
    return this.getClient(context).execute({ resourceId: context.site.id } /*input*/, token =>
      Observable /*query*/.zip(
        this.retrieveProxies(context, token),
        this._cacheService.get('assets/schemas/proxies.json', false, this.portalHeaders(token)),
        (p, s) => ({ proxies: p, schema: s })
      )
        .flatMap(response => this.validateAndGetProxies(response.proxies, response.schema))
    );
  }

  private retrieveProxies(context: FunctionAppContext, token: string): Observable<any> {
    return this._cacheService.get(context.urlTemplates.proxiesJsonUrl, false, this.headers(token)).catch(
      err =>
        err.status === 404
          ? Observable.throw({
              errorId: errorIds.proxyJsonNotFound,
              message: '',
              result: null,
            })
          : Observable.throw(err)
    );
  }

  private validateAndGetProxies(proxiesResponse: any, schemaResponse: any): Observable<ApiProxy[]> {
    let proxiesJson, schemaJson;

    try {
      proxiesJson = proxiesResponse.json();
    } catch (exception) {
      return Observable.throw({
        errorId: errorIds.proxyJsonNotValid,
        message: this._translateService.instant(PortalResources.proxyJsonInvalid).format(exception.message),
        result: null,
      });
    }

    try {
      schemaJson = schemaResponse.json();
    } catch (exception) {
      return Observable.throw({
        errorId: errorIds.proxySchemaNotValid,
        message: this._translateService.instant(PortalResources.schemaJsonInvalid).format(exception.message),
        result: null,
      });
    }

    if (proxiesJson) {
      const validateResult = jsonschema.validate(proxiesJson, schemaJson);
      if (!validateResult.valid) {
        return Observable.throw({
          errorId: errorIds.proxySchemaValidationFails,
          message: this._translateService.instant(PortalResources.error_schemaValidationProxies).format(validateResult.toString()),
          result: null,
        });
      }
    }

    return Observable.of(ApiProxy.fromJson(proxiesJson));
  }

  saveApiProxy(context: FunctionAppContext, jsonString: string): Result<Response> {
    const uri = context.urlTemplates.proxiesJsonUrl;

    this._cacheService.clearCachePrefix(uri);
    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService.put(uri, this.jsonHeaders(t, ['If-Match', '*']), jsonString)
    );
  }

  getFileContent(context: FunctionAppContext, file: VfsObject | string): Result<string> {
    const fileHref = typeof file === 'string' ? file : file.href;

    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(fileHref, false, this.headers(t)).map(r => r.text())
    );
  }

  saveFile(
    context: FunctionAppContext,
    file: VfsObject | string,
    updatedContent: string,
    functionInfo?: FunctionInfo
  ): Result<VfsObject | string> {
    const fileHref = typeof file === 'string' ? file : file.href;

    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .put(fileHref, this.jsonHeaders(t, ['Content-Type', 'plain/text'], ['If-Match', '*']), updatedContent)
        .map(() => file)
    );
  }

  deleteFile(context: FunctionAppContext, file: VfsObject | string, functionInfo?: FunctionInfo): Result<VfsObject | string> {
    const fileHref = typeof file === 'string' ? file : file.href;

    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService.delete(fileHref, this.jsonHeaders(t, ['Content-Type', 'plain/text'], ['If-Match', '*'])).map(() => file)
    );
  }

  getRuntimeGeneration(context: FunctionAppContext): Observable<string> {
    return this.getExtensionVersionFromAppSettings(context).map(v => FunctionsVersionInfoHelper.getFunctionGeneration(v));
  }

  private getExtensionVersionFromAppSettings(context: FunctionAppContext) {
    return this._cacheService.postArm(`${context.site.id}/config/appsettings/list`).map(r => {
      const appSettingsArm: ArmObj<any> = r.json();
      return appSettingsArm.properties[Constants.runtimeVersionAppSettingName];
    });
  }

  getTemplates(context: FunctionAppContext): Result<FunctionTemplate[]> {
    if (this._portalService.isEmbeddedFunctions) {
      const devTemplate: FunctionTemplate[] = JSON.parse(this._embeddedTemplates.templatesJson);
      return Observable.of({
        isSuccessful: true,
        result: devTemplate,
        error: null,
      });
    }

    // this is for dev scenario for loading custom templates
    try {
      if (localStorage.getItem('dev-templates')) {
        const devTemplate: FunctionTemplate[] = JSON.parse(localStorage.getItem('dev-templates'));
        this.localize(devTemplate);
        return Observable.of({
          isSuccessful: true,
          result: devTemplate,
          error: null,
        });
      }
    } catch (e) {
      console.error(e);
    }
    return this.azure.executeWithConditions([], { resourceId: context.site.id }, t =>
      this.getExtensionVersionFromAppSettings(context)
        .mergeMap(extensionVersion => {
          if (ArmUtil.isLinuxDynamic(context.site)) {
            extensionVersion = 'beta';
          }

          const headers = this.portalHeaders(t);
          if (this._globalStateService.showTryView) {
            headers.delete('Authorization');
          }

          return this._cacheService.get(
            `${Constants.cdnHost}api/templates?runtime=${extensionVersion || 'latest'}&cacheBreak=${window.appsvc.cacheBreakQuery}`,
            false,
            headers
          );
        })
        .map(r => {
          let templates = r.json() as FunctionTemplate[];

          // Linux Filter - Remove templates with extensions
          if (ArmUtil.isLinuxApp(context.site)) {
            templates = templates.filter(template => !template.metadata.extensions || template.metadata.extensions.length === 0);
          }

          this.localize(templates);
          return templates;
        })
    );
  }

  createFunction(context: FunctionAppContext, functionName: string, files: any, config: any) {
    const filesCopy = Object.assign({}, files);
    const sampleData = filesCopy['sample.dat'];
    delete filesCopy['sample.dat'];

    const content = JSON.stringify({ files: filesCopy, test_data: sampleData, config: config });
    const url = context.urlTemplates.getFunctionUrl(functionName);

    return this.getClient(context).executeWithConditions([], { resourceId: context.site.id }, t => {
      const headers = this.jsonHeaders(t);
      return this._cacheService
        .put(url, headers, content)
        .map(r => r.json() as FunctionInfo)
        .concatMap(r => {
          return ArmUtil.isLinuxApp(context.site) ? this.restartFunctionsHost(context).map(() => r) : Observable.of(r);
        })
        .do(() => {
          this._cacheService.clearCachePrefix(context.urlTemplates.scmSiteUrl);
        });
    });
  }

  statusCodeToText(code: number) {
    const statusClass = Math.floor(code / 100) * 100;
    return HttpConstants.statusCodeMap[code] || HttpConstants.genericStatusCodeMap[statusClass] || 'Unknown Status Code';
  }

  runHttpFunction(
    context: FunctionAppContext,
    functionInfo: FunctionInfo,
    url: string,
    model: HttpRunModel,
    key?: Param
  ): Result<RunFunctionResult> {
    return this.runtime.executeWithConditions([], { resourceId: context.site.id }, token => {
      const content = model.body;

      const regExp = /\{([^}]+)\}/g;
      const matchesPathParams = url.match(regExp);
      const processedParams = [];

      const splitResults = url.split('?');
      if (splitResults.length === 2) {
        url = splitResults[0];
      }

      if (matchesPathParams) {
        matchesPathParams.forEach(m => {
          const name = m
            .split(':')[0]
            .replace('{', '')
            .replace('}', '');
          processedParams.push(name);
          const param = model.queryStringParams.find(p => {
            return p.name === name;
          });
          if (param) {
            url = url.replace(m, param.value);
          }
        });
      }

      let queryString = '';
      if (key) {
        queryString = `?${key.name}=${key.value}`;
      }
      model.queryStringParams.forEach(p => {
        const findResult = processedParams.find(pr => {
          return pr === p.name;
        });

        if (!findResult) {
          if (!queryString) {
            queryString += '?';
          } else {
            queryString += '&';
          }
          queryString += p.name + '=' + p.value;
        }
      });
      url = url + queryString;
      const inputBinding =
        functionInfo.config && functionInfo.config.bindings ? functionInfo.config.bindings.find(e => e.type === 'httpTrigger') : null;

      let contentType: string;
      if (!inputBinding || (inputBinding && inputBinding.webHookType)) {
        contentType = 'application/json';
      }

      const headers = this.headers(token);
      if (contentType) {
        headers.append('Content-Type', contentType);
      }

      model.headers.forEach(h => {
        headers.append(h.name, h.value);
      });

      if (!headers.get('Content-Type')) {
        headers.append('Content-Type', 'application/json');
      }

      let response: Observable<Response>;
      switch (model.method) {
        case HttpMethods.GET:
          // make sure to pass 'true' to force make a request.
          // there is no scenario where we want cached data for a function run.
          response = this._cacheService.get(url, true, headers);
          break;
        case HttpMethods.POST:
          response = this._cacheService.post(url, true, headers, content);
          break;
        case HttpMethods.DELETE:
          response = this._cacheService.delete(url, headers);
          break;
        case HttpMethods.HEAD:
          response = this._cacheService.head(url, true, headers);
          break;
        case HttpMethods.PATCH:
          response = this._cacheService.patch(url, headers, content);
          break;
        case HttpMethods.PUT:
          response = this._cacheService.put(url, headers, content);
          break;
        default:
          response = this._cacheService.send(url, model.method, true, headers, content);
          break;
      }

      return this.runFunctionInternal(context, response, functionInfo);
    });
  }

  runFunction(context: FunctionAppContext, functionInfo: FunctionInfo, content: string) {
    const url = context.urlTemplates.getRunFunctionUrl(functionInfo.name.toLocaleLowerCase());
    const _content: string = JSON.stringify({ input: content });
    let contentType: string;

    try {
      JSON.parse(_content);
      contentType = 'application/json';
    } catch (e) {
      contentType = 'plain/text';
    }

    return this.runtime.executeWithConditions([], { resourceId: context.site.id }, t =>
      this.runFunctionInternal(
        context,
        this._cacheService.post(url, true, this.headers(t, ['Content-Type', contentType]), _content),
        functionInfo
      )
    );
  }

  deleteFunction(context: FunctionAppContext, functionInfo: FunctionInfo): Result<void> {
    return this.getClient(context)
      .execute({ resourceId: context.site.id }, t => {
        return this._cacheService.delete(functionInfo.href, this.jsonHeaders(t));
      })
      .do(r => {
        this._cacheService.clearCachePrefix(context.urlTemplates.functionsUrl);
      });
  }

  // TODO: [ahmels] change to Result<T>
  updateDisabledAppSettings(context: FunctionAppContext, infos: FunctionInfo[]): Observable<any> {
    if (infos.length > 0) {
      return this._siteService.getAppSettings(context.site.id, true).switchMap(r => {
        const appSettings = r.result;
        let needToUpdate = false;
        infos.forEach(info => {
          const appSettingName = `AzureWebJobs.${info.name}.Disabled`;
          if (info.config.disabled) {
            appSettings.properties[appSettingName] = 'true';
            needToUpdate = true;
          } else if (appSettings.properties[appSettingName]) {
            delete appSettings.properties[appSettingName];
            needToUpdate = true;
          }
        });

        return needToUpdate ? this._siteService.updateAppSettings(context.site.id, appSettings) : Observable.of(null);
      });
    } else {
      return Observable.of(null);
    }
  }

  getHostJson(context: FunctionAppContext): Result<Host> {
    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(context.urlTemplates.hostJsonUrl, false, this.headers(t)).map(r => r.json())
    );
  }

  saveFunction(context: FunctionAppContext, fi: FunctionInfo, config: any) {
    this._cacheService.clearCachePrefix(context.scmUrl);
    this._cacheService.clearCachePrefix(context.mainSiteUrl);
    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService.put(fi.href, this.jsonHeaders(t), JSON.stringify({ config: config })).map(r => r.json() as FunctionInfo)
    );
  }

  getHostToken(context: FunctionAppContext) {
    return ArmUtil.isLinuxApp(context.site)
      ? this.azure.executeWithConditions([], { resourceId: context.site.id }, t =>
          this._cacheService.get(Constants.serviceHost + `api/runtimetoken${context.site.id}`, false, this.portalHeaders(t))
        )
      : this.azure.execute({ resourceId: context.site.id }, t =>
          this._cacheService.get(context.urlTemplates.scmTokenUrl, false, this.headers(t))
        );
  }

  getHostKeys(context: FunctionAppContext): Result<FunctionKeys> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      Observable.zip(
        this._cacheService.get(context.urlTemplates.adminKeysUrl, false, this.headers(t)),
        this._cacheService.get(context.urlTemplates.masterKeyUrl, false, this.headers(t))
      ).map(r => {
        const hostKeys = r[0].json();
        hostKeys.keys = hostKeys.keys ? hostKeys.keys : [];
        const masterKey = r[1].json();
        if (masterKey) {
          hostKeys.keys.splice(0, 0, masterKey);
        }

        return hostKeys;
      })
    );
  }

  getBindingConfig(context: FunctionAppContext): Result<BindingConfig> {
    if (this._portalService.isEmbeddedFunctions) {
      const devBindings: BindingConfig = JSON.parse(this._embeddedTemplates.bindingsJson);
      return Observable.of({
        isSuccessful: true,
        result: devBindings,
        error: null,
      });

      // return Observable.of({ devBindings);
    }

    try {
      if (localStorage.getItem('dev-bindings')) {
        const devBindings: BindingConfig = JSON.parse(localStorage.getItem('dev-bindings'));
        this.localize(devBindings);
        return Observable.of({
          isSuccessful: true,
          result: devBindings,
          error: null,
        });
      }
    } catch (e) {
      console.error(e);
    }

    return this.azure.execute({ resourceId: context.site.id }, t =>
      this.getExtensionVersionFromAppSettings(context)
        .concatMap(extensionVersion => {
          if (!extensionVersion) {
            extensionVersion = 'latest';
          }

          const headers = this.portalHeaders(t);
          if (this._globalStateService.showTryView) {
            headers.delete('Authorization');
          }

          return this._cacheService.get(
            `${Constants.cdnHost}api/bindingconfig?runtime=${extensionVersion}&cacheBreak=${window.appsvc.cacheBreakQuery}`,
            false,
            headers
          );
        })
        .map(r => {
          const bindingConfig = r.json() as BindingConfig;

          // Linux Filter - remove bindings with extensions
          if (ArmUtil.isLinuxApp(context.site)) {
            const filteredBindings = bindingConfig.bindings.filter(binding => !binding.extension);
            bindingConfig.bindings = filteredBindings;
          }

          this.localize(bindingConfig);
          return bindingConfig;
        })
    );
  }

  updateFunction(context: FunctionAppContext, fi: FunctionInfo): Result<FunctionInfo> {
    const fiCopy = <FunctionInfo>{};
    for (const prop in fi) {
      if (fi.hasOwnProperty(prop) && prop !== 'functionApp') {
        fiCopy[prop] = fi[prop];
      }
    }

    this._cacheService.clearCachePrefix(context.scmUrl);
    this._cacheService.clearCachePrefix(context.mainSiteUrl);
    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService.put(fi.href, this.jsonHeaders(t), JSON.stringify(fiCopy)).map(r => r.json() as FunctionInfo)
    );
  }

  getFunctionErrors(context: FunctionAppContext, fi: FunctionInfo, handleUnauthorized?: boolean): Result<string[]> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .get(context.urlTemplates.getFunctionRuntimeErrorsUrl(fi.name), false, this.headers(t))
        .map(r => (r.json().errors || []) as string[])
    );
  }

  getHostErrors(context: FunctionAppContext): Result<string[]> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(context.urlTemplates.runtimeStatusUrl, true, this.headers(t)).map(r => (r.json().errors || []) as string[])
    );
  }

  getFunctionHostStatus(context: FunctionAppContext): Result<HostStatus> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(context.urlTemplates.runtimeStatusUrl, true, this.headers(t)).map(r => r.json() as HostStatus)
    );
  }

  getWorkerRuntimeRequired(context: FunctionAppContext): Observable<boolean> {
    return this.getFunctionHostStatus(context).map(r => {
      if (r.isSuccessful) {
        const runtimeVersion = new Version(r.result.version);
        if (this._workerRuntimeRequired(runtimeVersion)) {
          return true;
        }
      }
      return false;
    });
  }

  private _workerRuntimeRequired(runtimeVersion: Version): boolean {
    if (runtimeVersion.majorVersion && runtimeVersion.minorVersion) {
      return runtimeVersion.majorVersion === 2 && runtimeVersion.minorVersion >= 12050;
    }
    return false;
  }

  getLogs(context: FunctionAppContext, fi: FunctionInfo, range?: number, force: boolean = false): Result<string> {
    const url = context.urlTemplates.getFunctionLogUrl(fi.name);

    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(url, force, this.headers(t)).concatMap(r => {
        let files: VfsObject[] = r.json();
        if (files.length > 0) {
          files = files
            .map(e => Object.assign({}, e, { parsedTime: new Date(e.mtime) }))
            .sort((a, b) => a.parsedTime.getTime() - b.parsedTime.getTime());

          const headers = range ? this.headers(t, ['Range', `bytes=-${range}`]) : this.headers(t);

          return this._cacheService.get(files.pop().href, force, headers).map(f => {
            const content = f.text();
            if (range) {
              const index = content.indexOf('\n');
              return <string>(index !== -1 ? content.substring(index + 1) : content);
            } else {
              return content;
            }
          });
        } else {
          return Observable.of('');
        }
      })
    );
  }

  getVfsObjects(context: FunctionAppContext, fi: FunctionInfo | string): Result<VfsObject[]> {
    const href = typeof fi === 'string' ? fi : fi.script_root_path_href;
    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(href, false, this.headers(t)).map(e => <VfsObject[]>e.json())
    );
  }

  getFunctionKeys(context: FunctionAppContext, functionInfo: FunctionInfo): Result<FunctionKeys> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .get(context.urlTemplates.getFunctionKeysUrl(functionInfo.name), false, this.headers(t))
        .map(r => r.json() as FunctionKeys)
    );
  }

  createKey(context: FunctionAppContext, keyName: string, keyValue: string, functionInfo?: FunctionInfo): Result<FunctionKey> {
    this.clearKeysCache(context, functionInfo);

    const url = functionInfo
      ? context.urlTemplates.getFunctionKeyUrl(functionInfo.name, keyName)
      : context.urlTemplates.getAdminKeyUrl(keyName);

    const body = keyValue
      ? JSON.stringify({
          name: keyName,
          value: keyValue,
        })
      : null;

    return this.runtime.execute({ resourceId: context.site.id }, t => {
      const req = body ? this._cacheService.put(url, this.jsonHeaders(t), body) : this._cacheService.post(url, true, this.jsonHeaders(t));
      return req.map(r => r.json() as FunctionKey);
    });
  }

  deleteKey(context: FunctionAppContext, key: FunctionKey, functionInfo?: FunctionInfo): Result<void> {
    this.clearKeysCache(context, functionInfo);

    const url = functionInfo
      ? context.urlTemplates.getFunctionKeyUrl(functionInfo.name, key.name)
      : context.urlTemplates.getAdminKeyUrl(key.name);

    return this.runtime.execute({ resourceId: context.site.id }, t => this._cacheService.delete(url, this.jsonHeaders(t)));
  }

  renewKey(context: FunctionAppContext, key: FunctionKey, functionInfo?: FunctionInfo): Result<FunctionKey> {
    this.clearKeysCache(context, functionInfo);

    const url = functionInfo
      ? context.urlTemplates.getFunctionKeyUrl(functionInfo.name, key.name)
      : context.urlTemplates.getAdminKeyUrl(key.name);

    return this.runtime.execute({ resourceId: context.site.id }, t => this._cacheService.post(url, true, this.jsonHeaders(t)));
  }

  private clearKeysCache(context: FunctionAppContext, functionInfo?: FunctionInfo) {
    if (functionInfo) {
      this._cacheService.clearCachePrefix(context.urlTemplates.getFunctionKeysUrl(functionInfo.name));
    } else {
      this._cacheService.clearCachePrefix(context.urlTemplates.adminKeysUrl);
      this._cacheService.clearCachePrefix(context.urlTemplates.systemKeysUrl);
    }
  }

  fireSyncTrigger(context: FunctionAppContext): void {
    if (ArmUtil.isLinuxDynamic(context.site)) {
      this._cacheService
        .postArm(`${context.site.id}/hostruntime/admin/host/synctriggers`, true)
        .subscribe(
          success => this._logService.verbose(LogCategories.syncTriggers, success),
          error => this._logService.error(LogCategories.syncTriggers, '/sync-triggers-error', error)
        );
    } else {
      const url = context.urlTemplates.syncTriggersUrl;
      this.azure
        .execute({ resourceId: context.site.id }, t => this._cacheService.post(url, true, this.jsonHeaders(t)))
        .subscribe(
          success => this._logService.verbose(LogCategories.syncTriggers, success),
          error => this._logService.error(LogCategories.syncTriggers, '/sync-triggers-error', error)
        );
    }
  }

  isSourceControlEnabled(context: FunctionAppContext): Result<boolean> {
    return this.azure.executeWithConditions(
      [],
      { resourceId: context.site.id },
      this._cacheService.getArm(`${context.site.id}/config/web`).map(r => {
        const config: ArmObj<SiteConfig> = r.json();
        return !config.properties['scmType'] || config.properties['scmType'] !== 'None';
      })
    );
  }

  isSlot(context: FunctionAppContext | string): boolean {
    return !!this.getSlotName(context);
  }

  getSlotName(context: FunctionAppContext | string): string {
    const id = typeof context === 'string' ? context : context.site.id;
    const descriptor = new ArmSiteDescriptor(id);
    return descriptor.slot;
  }

  getSlotsList(context: FunctionAppContext | string): Result<ArmObj<Site>[]> {
    const id = typeof context === 'string' ? context : context.site.id;
    return this.isSlot(context)
      ? Observable.of({
          isSuccessful: true,
          result: [],
          error: null,
        })
      : this.azure.executeWithConditions(
          [],
          typeof context !== 'string' ? { resourceId: context.site.id } : null,
          this._cacheService.getArm(`${id}/slots`).map(r => r.json().value as ArmObj<Site>[])
        );
  }

  // TODO: [ahmels] change to Result<T>
  reachableInternalLoadBalancerApp(context: FunctionAppContext): Observable<boolean> {
    if (
      context &&
      context.site &&
      context.site.properties.hostingEnvironmentProfile &&
      context.site.properties.hostingEnvironmentProfile.id
    ) {
      return this._cacheService.getArm(context.site.properties.hostingEnvironmentProfile.id, false, '2016-09-01').mergeMap(r => {
        const ase: ArmObj<HostingEnvironment> = r.json();
        if (ase.properties.internalLoadBalancingMode && ase.properties.internalLoadBalancingMode !== 'None') {
          return this.pingScmSite(context).map(result => result.isSuccessful);
        } else {
          return Observable.of(true);
        }
      });
    } else {
      return Observable.of(true);
    }
  }

  getFunctionAppEditMode(context: FunctionAppContext): Result<FunctionAppEditMode> {
    // The we have 2 settings to check here. There is the SourceControl setting which comes from /config/web
    // and there is FUNCTION_APP_EDIT_MODE which comes from app settings.
    // editMode (true -> readWrite, false -> readOnly)
    // Table
    // |Slots | SourceControl | AppSettingValue | EditMode                      |
    // |------|---------------|-----------------|-------------------------------|
    // | No   | true          | readWrite       | ReadWriteSourceControlled     |
    // | No   | true          | readOnly        | ReadOnlySourceControlled      |
    // | No   | true          | undefined       | ReadOnlySourceControlled      |
    // | No   | false         | readWrite       | ReadWrite                     |
    // | No   | false         | readOnly        | ReadOnly                      |
    // | No   | false         | undefined       | ReadWrite                     |

    // | Yes  | true          | readWrite       | ReadWriteSourceControlled     |
    // | Yes  | true          | readOnly        | ReadOnlySourceControlled      |
    // | Yes  | true          | undefined       | ReadOnlySourceControlled      |
    // | Yes  | false         | readWrite       | ReadWrite                     |
    // | Yes  | false         | readOnly        | ReadOnly                      |
    // | Yes  | false         | undefined       | ReadOnlySlots                 |
    // |______|_______________|_________________|_______________________________|

    return this.azure.executeWithConditions(
      [],
      { resourceId: context.site.id },
      Observable.zip(
        this.isSourceControlEnabled(context),
        this._siteService.getAppSettings(context.site.id),
        this.isSlot(context)
          ? Observable.of({ isSuccessful: true, result: true, error: null })
          : this.getSlotsList(context).map(r => (r.isSuccessful ? Object.assign(r, { result: r.result.length > 0 }) : r)),
        this.getFunctions(context),
        (a, b, s, f) => ({ sourceControlEnabled: a, appSettingsResponse: b, hasSlots: s, functions: f })
      )
        .map(result => {
          const appSettings: ArmObj<{ [key: string]: string }> = result.appSettingsResponse.isSuccessful
            ? result.appSettingsResponse.result
            : null;

          const sourceControlled = result.sourceControlEnabled.isSuccessful && result.sourceControlEnabled.result;

          let editModeSettingString: string = appSettings ? appSettings.properties[Constants.functionAppEditModeSettingName] || '' : '';
          editModeSettingString = editModeSettingString.toLocaleLowerCase();
          const vsCreatedFunc = result.functions.isSuccessful
            ? !!result.functions.result.find((fc: any) => !!fc.config.generatedBy)
            : false;
          const usingRunFromZip = appSettings ? this._getRFZSetting(appSettings) !== '0' : false;
          const usingLocalCache =
            appSettings && appSettings.properties[Constants.localCacheOptionSettingName] === Constants.localCacheOptionSettingValue;
          const hasSlots = result.hasSlots.result;
          const isLinuxDynamic = ArmUtil.isLinuxDynamic(context.site);
          const isContainerApp = appSettings && appSettings.properties[ContainerConstants.appServiceStorageSetting] === 'false';

          const resolveReadOnlyMode = () => {
            if (sourceControlled) {
              return FunctionAppEditMode.ReadOnlySourceControlled;
            } else if (vsCreatedFunc) {
              return FunctionAppEditMode.ReadOnlyVSGenerated;
            } else if (hasSlots) {
              return FunctionAppEditMode.ReadOnly;
            } else {
              return FunctionAppEditMode.ReadOnly;
            }
          };

          const resolveReadWriteMode = () => {
            if (sourceControlled) {
              return FunctionAppEditMode.ReadWriteSourceControlled;
            } else if (vsCreatedFunc) {
              return FunctionAppEditMode.ReadWriteVSGenerated;
            } else if (hasSlots) {
              return FunctionAppEditMode.ReadWrite;
            } else {
              return FunctionAppEditMode.ReadWrite;
            }
          };

          const resolveUndefined = () => {
            if (sourceControlled) {
              return FunctionAppEditMode.ReadOnlySourceControlled;
            } else if (vsCreatedFunc) {
              return FunctionAppEditMode.ReadOnlyVSGenerated;
            } else if (hasSlots) {
              return FunctionAppEditMode.ReadOnlySlots;
            } else {
              return FunctionAppEditMode.ReadWrite;
            }
          };

          if (usingRunFromZip) {
            return FunctionAppEditMode.ReadOnlyRunFromZip;
          } else if (usingLocalCache) {
            return FunctionAppEditMode.ReadOnlyLocalCache;
          } else if (isLinuxDynamic) {
            return FunctionAppEditMode.ReadOnlyLinuxDynamic;
          } else if (isContainerApp) {
            return FunctionAppEditMode.ReadOnlyBYOC;
          } else if (editModeSettingString === Constants.ReadWriteMode) {
            return resolveReadWriteMode();
          } else if (editModeSettingString === Constants.ReadOnlyMode) {
            return resolveReadOnlyMode();
          } else {
            return resolveUndefined();
          }
        })
        .catch(() => Observable.of(FunctionAppEditMode.ReadWrite))
    );
  }

  private _getRFZSetting(appSettings: ArmObj<ApplicationSettings>) {
    return (
      appSettings.properties[Constants.WebsiteUseZip] ||
      appSettings.properties[Constants.WebsiteRunFromZip] ||
      appSettings.properties[Constants.WebsiteRunFromPackage] ||
      '0'
    );
  }

  public getAuthSettings(context: FunctionAppContext): Result<AuthSettings> {
    return this.azure.executeWithConditions(
      [],
      { resourceId: context.site.id },
      this._cacheService.postArm(`${context.site.id}/config/authsettings/list`).map(r => {
        const auth: ArmObj<any> = r.json();
        return {
          easyAuthEnabled: auth.properties['enabled'] && auth.properties['unauthenticatedClientAction'] !== 1,
          AADConfigured: auth.properties['clientId'] || false,
          AADNotConfigured: auth.properties['clientId'] ? false : true,
          clientCertEnabled: context.site.properties.clientCertEnabled,
        };
      })
    );
  }

  /**
   * This method just pings the root of the SCM site. It doesn't care about the response in anyway or use it.
   */
  pingScmSite(context: FunctionAppContext): Result<boolean> {
    if (ArmUtil.isLinuxDynamic(context.site)) {
      return Observable.of({
        isSuccessful: true,
        result: true,
        error: null,
      });
    }

    return this.azure.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .get(context.urlTemplates.pingScmSiteUrl, true, this.headers(t))
        .map(_ => true)
        .catch(() => Observable.of(false))
    );
  }

  private runFunctionInternal(context: FunctionAppContext, response: Observable<Response>, functionInfo: FunctionInfo) {
    return response
      .catch((e: Response) => {
        return this.getAuthSettings(context)
          .map(r => (r.isSuccessful ? r.result : { easyAuthEnabled: false, clientCertEnabled: false }))
          .mergeMap(authSettings => {
            if (authSettings.easyAuthEnabled) {
              return Observable.of({
                status: 401,
                statusText: this.statusCodeToText(401),
                text: () => this._translateService.instant(PortalResources.functionService_authIsEnabled),
              });
            } else if (authSettings.clientCertEnabled) {
              return Observable.of({
                status: 401,
                statusText: this.statusCodeToText(401),
                text: () => this._translateService.instant(PortalResources.functionService_clientCertEnabled),
              });
            } else if (e.status === 200 && e.type === ResponseType.Error) {
              return Observable.of({
                status: 502,
                statusText: this.statusCodeToText(502),
                text: () =>
                  this._translateService.instant(PortalResources.functionService_errorRunningFunc, {
                    name: functionInfo.name,
                  }),
              });
            } else if (e.status === 0 && e.type === ResponseType.Error) {
              return Observable.of({
                status: 0,
                statusText: this.statusCodeToText(0),
                text: () => '',
              });
            } else {
              let text = '';
              try {
                text = JSON.stringify(e.json(), undefined, 2);
              } catch (ex) {
                text = e.text();
              }

              return Observable.of({
                status: e.status,
                statusText: this.statusCodeToText(e.status),
                text: () => text,
              });
            }
          });
      })
      .map(r => <RunFunctionResult>{ statusCode: r.status, statusText: this.statusCodeToText(r.status), content: r.text() });
  }

  getGeneratedSwaggerData(context: FunctionAppContext, key: string): Result<any> {
    const url: string = context.urlTemplates.getGeneratedSwaggerDataUrl;
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(`${url}?code=${key}`, false, this.headers(t)).map(r => r.json())
    );
  }

  getSwaggerDocument(context: FunctionAppContext, key: string): Result<any> {
    const url: string = context.urlTemplates.getSwaggerDocumentUrl;
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(`${url}?code=${key}`, false, this.headers(t)).map(r => r.json())
    );
  }

  addOrUpdateSwaggerDocument(context: FunctionAppContext, swaggerUrl: string, content: string): Result<any> {
    return this.runtime.execute(
      { resourceId: context.site.id },
      this._cacheService.post(swaggerUrl, false, this.jsonHeaders(null), content).map(r => r.json())
    );
  }

  deleteSwaggerDocument(context: FunctionAppContext, swaggerUrl: string) {
    return this.runtime.execute({ resourceId: context.site.id }, this._cacheService.delete(swaggerUrl));
  }

  saveHostJson(context: FunctionAppContext, jsonString: string): Result<any> {
    return this.getClient(context).execute({ resourceId: context.site.id }, t =>
      this._cacheService.put(context.urlTemplates.hostJsonUrl, this.jsonHeaders(t, ['If-Match', '*']), jsonString).map(r => r.json())
    );
  }

  createSystemKey(context: FunctionAppContext, keyName: string) {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .post(context.urlTemplates.getSystemKeyUrl(keyName), true, this.jsonHeaders(t, ['If-Match', '*']))
        .map(r => r.json())
    );
  }

  // Try and the list of runtime extensions install.
  // If there was an error getting the list, show an error. return an empty list.
  getHostExtensions(context: FunctionAppContext): Result<any> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(context.urlTemplates.runtimeHostExtensionsUrl, true, this.headers(t)).map(r => r.json() as FunctionKeys)
    );
  }

  // TOOD: [soninaren] Capture 409
  // TODO: [soninaren] returns error object when resulted in error
  // TODO: [soninaren] error.id is not defined
  installExtension(context: FunctionAppContext, extension: RuntimeExtension): Result<ExtensionInstallStatus> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .post(context.urlTemplates.runtimeHostExtensionsUrl, true, this.jsonHeaders(t), extension)
        .map(r => r.json() as ExtensionInstallStatus)
    );
  }

  uninstallExtension(context: FunctionAppContext, extensionId: string): Result<ExtensionInstallStatus> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .delete(context.urlTemplates.getRuntimeHostExtensionsIdUrl(extensionId), this.headers(t))
        .map(r => r.json() as ExtensionInstallStatus)
    );
  }

  getExtensionInstallStatus(context: FunctionAppContext, jobId: string): Result<ExtensionInstallStatus> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .get(context.urlTemplates.getRuntimeHostExtensionsJobStatusUrl(jobId), true, this.headers(t))
        .map(r => r.json() as ExtensionInstallStatus)
    );
  }

  getExtensionJobsStatus(context: FunctionAppContext): Result<ExtensionJobsStatus> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .get(context.urlTemplates.runtimeHostExtensionsJobsUrl, true, this.headers(t))
        .map(r => r.json() as ExtensionJobsStatus)
    );
  }

  getExtensionJson(context: FunctionAppContext): Result<ExtensionInfo[]> {
    return this.azure.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .get(context.urlTemplates.extensionJsonUrl, true, this.headers(t))
        .map(r => r.json() as ExtensionsJson)
        .map(r => r.extensions)
    );
  }

  updateHostState(context: FunctionAppContext, stateValue: 'offline' | 'running'): Result<any> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService.put(context.urlTemplates.updateHostStateUrl, this.jsonHeaders(t), `'${stateValue}'`)
    );
  }

  getSystemKey(context: FunctionAppContext): Result<FunctionKeys> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService.get(context.urlTemplates.systemKeysUrl, false, this.headers(t)).map(r => r.json() as FunctionKeys)
    );
  }

  getEventGridUri(context: FunctionAppContext, functionName: string): Result<string> {
    return Observable.zip(this.getSystemKey(context), this.getRuntimeGeneration(context)).map(tuple => {
      if (tuple[0].isSuccessful) {
        const generation = tuple[1];
        const eventGridName = generation === 'V1' ? Constants.eventGridName_v1 : Constants.eventGridName_v2;
        const key = tuple[0].result.keys.find(k => k.name === eventGridName);
        return {
          isSuccessful: true,
          result: key ? FunctionsVersionInfoHelper.getEventGridUri(generation, context.mainSiteUrl, functionName, key.value) : '',
          error: null,
        };
      } else {
        return (tuple[0] as any) as HttpResult<string>;
      }
    });
  }

  // // Modeled off of EventHub trigger's 'custom' tab when creating a new Event Hub connection
  // createApplicationSetting(context: FunctionAppContext, appSettingName: string, appSettingValue: string, replaceIfExists: boolean = true): Observable<any> | null {
  //     if (appSettingName && appSettingValue) {
  //         return this._cacheService.postArm(`${context.site.id}/config/appsettings/list`, true).flatMap(
  //             r => {
  //                 const appSettings: ArmObj<any> = r.json();
  //                 if (!replaceIfExists && appSettings.properties[appSettingName]) {
  //                     return Observable.of(r);
  //                 }
  //                 appSettings.properties[appSettingName] = appSettingValue;
  //                 return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);
  //             });
  //     } else {
  //         return null;
  //     }
  // }

  // TODO: [ahmels] change to Result<T>
  createAuthSettings(context: FunctionAppContext, newAuthSettings: Map<string, any>): Observable<any> {
    if (newAuthSettings.size > 0) {
      return this._cacheService.postArm(`${context.site.id}/config/authsettings/list`, true).flatMap(r => {
        const authSettings: ArmObj<any> = r.json();
        newAuthSettings.forEach((value, key) => {
          authSettings.properties[key] = value;
        });
        return this._cacheService.putArm(authSettings.id, null, authSettings);
      });
    } else {
      return Observable.of(null);
    }
  }

  restartFunctionsHost(context: FunctionAppContext): Result<void> {
    return this.runtime.execute({ resourceId: context.site.id }, t =>
      this._cacheService.post(context.urlTemplates.restartHostUrl, true, this.headers(t))
    );
  }

  getAppContext(resourceId: string): Observable<FunctionAppContext> {
    return this._cacheService.getArm(resourceId).map(r => ArmUtil.mapArmSiteToContext(r.json(), this._injector));
  }

  getAppContentAsZip(context: FunctionAppContext, includeCsProj: boolean, includeAppSettings: boolean): Result<any> {
    const url = ArmUtil.isLinuxApp(context.site)
      ? `${context.mainSiteUrl}/admin/functions/download?includeCsproj=${includeCsProj}&includeAppSettings=${includeAppSettings}`
      : `${context.scmUrl}/api/functions/admin/download?includeCsproj=${includeCsProj}&includeAppSettings=${includeAppSettings}`;
    const client = ArmUtil.isLinuxApp(context.site) ? this.runtime : this.azure;

    return client.execute({ resourceId: context.site.id }, t =>
      this._cacheService
        .get(url, true, this.headers(t), null, ResponseContentType.Blob)
        .map(r => new Blob([r.blob()], { type: 'application/octet-stream' }))
    );
  }

  // these 2 functions are only for try app service scenarios.
  // It's a hack to not have to change a lot of code since soon try will fork this anyway.
  // DO NOT use this for anything new.
  _tryFunctionsBasicAuthToken: string;
  setTryFunctionsToken(token: string) {
    this._tryFunctionsBasicAuthToken = token;
  }

  private localize(objectToLocalize: any): any {
    if (typeof objectToLocalize === 'string' && objectToLocalize.startsWith('$')) {
      const key = objectToLocalize.substring(1, objectToLocalize.length);
      objectToLocalize = this._translateService.instant(key);
    } else if (Array.isArray(objectToLocalize)) {
      for (let i = 0; i < objectToLocalize.length; i++) {
        objectToLocalize[i] = this.localize(objectToLocalize[i]);
      }
    } else if (typeof objectToLocalize === 'object') {
      for (const property in objectToLocalize) {
        if (property === 'files' || property === 'defaultValue' || property === 'function') {
          continue;
        }
        if (objectToLocalize.hasOwnProperty(property)) {
          objectToLocalize[property] = this.localize(objectToLocalize[property]);
        }
      }
    }
    return objectToLocalize;
  }

  private portalHeaders(authToken: string, ...aditionalHeaders: [string, string][]): Headers {
    const headers = aditionalHeaders.slice();
    headers.unshift(['portal-token', authToken]);
    return this.jsonHeaders.apply(this, headers);
  }

  private jsonHeaders(authTokenOrHeader: string | [string, string], ...additionalHeaders: [string, string][]): Headers {
    const headers: Array<[string, string] | string> = additionalHeaders.slice();
    headers.unshift(['Content-Type', 'application/json']);
    if (authTokenOrHeader) {
      headers.unshift(authTokenOrHeader);
    }
    return this.headers.apply(this, headers);
  }

  private headers(authTokenOrHeader: string | [string, string], ...additionalHeaders: [string, string][]): Headers {
    const headers = new Headers();
    if (typeof authTokenOrHeader === 'string' && authTokenOrHeader.length > 0) {
      if (authTokenOrHeader.startsWith('masterKey ')) {
        headers.set('x-functions-key', authTokenOrHeader.substring('masterKey '.length));
      } else {
        headers.set('Authorization', `Bearer ${authTokenOrHeader}`);
      }
    } else if (this._tryFunctionsBasicAuthToken) {
      headers.set('Authorization', `Basic ${this._tryFunctionsBasicAuthToken}`);
    }

    if (Array.isArray(authTokenOrHeader)) {
      headers.set(authTokenOrHeader[0], authTokenOrHeader[1]);
    }

    additionalHeaders.forEach(header => {
      headers.set(header[0], header[1]);
    });

    return headers;
  }
}

/**
 * returns the file name from a VfsObject or an href
 * @param file either a VfsObject or a string representing the file's href.
 */
// function getFileName(file: VfsObject | string): string {
//     if (typeof file === 'string') {
//         // if `file` is a string, that means it's in the format:
//         //     https://<scmUrl>/api/vfs/path/to/file.ext
//         return file
//             .split('/') // [ 'https:', '', '<scmUrl>', 'api', 'vfs', 'path', 'to', 'file.ext' ]
//             .pop(); // 'file.ext'
//     } else {
//         return file.name;
//     }
// }
