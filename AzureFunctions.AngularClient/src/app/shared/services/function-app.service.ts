import { StartupInfo } from './../models/portal';
import { GlobalStateService } from './global-state.service';
import { Host } from './../models/host';
import { ArmSiteDescriptor } from './../resourceDescriptors';
import { HttpMethods, HttpConstants } from './../models/constants';
import { UserService } from './user.service';
import { HostingEnvironment } from './../models/arm/hosting-environment';
import { FunctionAppContext } from './../function-app-context';
import { CacheService } from 'app/shared/services/cache.service';
import { Injectable, Injector } from '@angular/core';
import { Headers, Response, ResponseType } from '@angular/http';
import { FunctionInfo } from 'app/shared/models/function-info';
import { FunctionAppHttpResult } from './../models/function-app-http-result';
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
import { HttpRunModel } from 'app/shared/models/http-run';
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

type Result<T> = Observable<FunctionAppHttpResult<T>>;
@Injectable()
export class FunctionAppService {
    private readonly runtime: ConditionalHttpClient;
    private readonly azure: ConditionalHttpClient;
    private readonly _embeddedTemplates: Templates;

    private startupInfo: StartupInfo;

    constructor(private _cacheService: CacheService,
        private _translateService: TranslateService,
        private _userService: UserService,
        private _injector: Injector,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        logService: LogService) {

        this._userService.getStartupInfo()
            .subscribe(info => {
                this.startupInfo = info;
            });

        this.runtime = new ConditionalHttpClient(_cacheService, logService, context => this.getRuntimeToken(context), 'NoClientCertificate', 'NotOverQuota', 'NotStopped', 'ReachableLoadballancer');
        this.azure = new ConditionalHttpClient(_cacheService, logService, _ => _userService.getStartupInfo().map(i => i.token), 'NotOverQuota', 'ReachableLoadballancer');
        this._embeddedTemplates = new Templates();
    }

    private getRuntimeToken(context: FunctionAppContext): Observable<string> {
        return this._userService.getStartupInfo()
            .concatMap(info => ArmUtil.isLinuxApp(context.site)
                ? this._cacheService.get(Constants.serviceHost + `api/runtimetoken${context.site.id}`, false, this.portalHeaders(info.token))
                : this._cacheService.get(context.urlTemplates.scmTokenUrl, false, this.headers(info.token)))
            .map(r => r.json());
    }

    getClient(context: FunctionAppContext) {
        return ArmUtil.isLinuxApp(context.site) ? this.runtime : this.azure;
    }

    getFunction(context: FunctionAppContext, name: string): Result<FunctionInfo> {
        return this.getClient(context).execute(context, t => Observable.zip(
            this._cacheService.get(context.urlTemplates.getFunctionUrl(name), false, this.headers(t)),
            this._cacheService.postArm(`${context.site.id}/config/appsettings/list`),
            (functions, appSettings) => ({ function: functions.json() as FunctionInfo, appSettings: appSettings.json() }))
            .map(result => {
                // For runtime 2.0 we use settings for disabling functions
                const appSettings = result.appSettings as ArmObj<{ [key: string]: string }>;
                if (FunctionsVersionInfoHelper.getFunctionGeneration(appSettings.properties[Constants.runtimeVersionAppSettingName]) === 'V2') {
                    const disabledSetting = appSettings.properties[`AzureWebJobs.${result.function.name}.Disabled`];
                    result.function.config.disabled = (disabledSetting && disabledSetting.toLocaleLowerCase() === 'true');
                }
                return result.function;
            }));
    }

    getFunctions(context: FunctionAppContext): Result<FunctionInfo[]> {
        return this.getClient(context).execute(context, t => Observable.zip(
            this._cacheService.get(context.urlTemplates.functionsUrl, false, this.headers(t)),
            this._cacheService.postArm(`${context.site.id}/config/appsettings/list`),
            (functions, appSettings) => ({ functions: functions.json() as FunctionInfo[], appSettings: appSettings.json() }))
            .map(result => {
                // For runtime 2.0 we use settings for disabling functions
                const appSettings = result.appSettings as ArmObj<{ [key: string]: string }>;
                if (FunctionsVersionInfoHelper.getFunctionGeneration(appSettings.properties[Constants.runtimeVersionAppSettingName]) === 'V2') {
                    result.functions.forEach(f => {
                        const disabledSetting = appSettings.properties[`AzureWebJobs.${f.name}.Disabled`];

                        // Config doesn't exist for embedded
                        if (f.config) {
                            f.config.disabled = (disabledSetting && disabledSetting.toLocaleLowerCase() === 'true');
                        }
                    });
                }
                return result.functions;
            }));
    }

    getApiProxies(context: FunctionAppContext): Result<ApiProxy[]> {
        const client = this.getClient(context);
        return client.execute(context, t => Observable.zip(
            this._cacheService.get(context.urlTemplates.proxiesJsonUrl, false, this.headers(t))
                .catch(err => err.status === 404
                    ? Observable.throw(errorIds.proxyJsonNotFound)
                    : Observable.throw(err)),
            this._cacheService.get('assets/schemas/proxies.json', false, this.portalHeaders(t)),
            (p, s) => ({ proxies: p, schema: s.json() })
        ).map(r => {
            const proxies = r.proxies.json();
            if (proxies.proxies) {
                const validateResult = jsonschema.validate(proxies, r.schema).toString();
                if (validateResult) {
                    // TODO: [alrod] handle error
                    return ApiProxy.fromJson({});
                }
            }
            return ApiProxy.fromJson(proxies);
        }));
    }

    saveApiProxy(context: FunctionAppContext, jsonString: string): Result<Response> {
        const uri = context.urlTemplates.proxiesJsonUrl;

        this._cacheService.clearCachePrefix(uri);
        return this.getClient(context).execute(context, t => this._cacheService.put(uri, this.jsonHeaders(t, ['If-Match', '*']), jsonString));
    }

    getFileContent(context: FunctionAppContext, file: VfsObject | string): Result<string> {
        const fileHref = typeof file === 'string' ? file : file.href;

        return this.getClient(context).execute(context, t => this._cacheService.get(fileHref, false, this.headers(t)).map(r => r.text()));
    }

    saveFile(context: FunctionAppContext, file: VfsObject | string, updatedContent: string, functionInfo?: FunctionInfo): Result<VfsObject | string> {
        const fileHref = typeof file === 'string' ? file : file.href;

        return this.getClient(context).execute(context, t =>
            this._cacheService.put(fileHref, this.jsonHeaders(t, ['Content-Type', 'plain/text'], ['If-Match', '*']), updatedContent).map(() => file));
    }

    deleteFile(context: FunctionAppContext, file: VfsObject | string, functionInfo?: FunctionInfo): Result<VfsObject | string> {
        const fileHref = typeof file === 'string' ? file : file.href;

        return this.getClient(context).execute(context, t =>
            this._cacheService.delete(fileHref, this.jsonHeaders(t, ['Content-Type', 'plain/text'], ['If-Match', '*'])).map(() => file));
    }

    getRuntimeGeneration(context: FunctionAppContext): Observable<string> {
        return this.getExtensionVersionFromAppSettings(context)
            .map(v => FunctionsVersionInfoHelper.getFunctionGeneration(v));
    }

    private getExtensionVersionFromAppSettings(context: FunctionAppContext) {
        return this._cacheService.postArm(`${context.site.id}/config/appsettings/list`)
            .map(r => {
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
                error: null
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
                    error: null
                });
            }
        } catch (e) {
            console.error(e);
        }
        return this.azure.executeWithConditions([], context, t =>
            this.getExtensionVersionFromAppSettings(context)
                .mergeMap(extensionVersion => {
                    const headers = this.portalHeaders(t);
                    if (this._globalStateService.showTryView) {
                        headers.delete('Authorization');
                    }

                    return this._cacheService.get(
                        Constants.serviceHost + 'api/templates?runtime=' + (extensionVersion || 'latest'),
                        true,
                        headers);
                })
                .map(r => {
                    const object = r.json();
                    this.localize(object);
                    return object;
                }));
    }

    createFunction(context: FunctionAppContext, functionName: string, templateId: string): Result<FunctionInfo> {
        const body = templateId
            ? {
                name: functionName,
                templateId: (templateId && templateId !== 'Empty' ? templateId : null)
            }
            : {
                config: {}
            };

        return this.getClient(context).execute(context, t =>
            this._cacheService.put(context.urlTemplates.getFunctionUrl(functionName), this.jsonHeaders(t), JSON.stringify(body))
                .map(r => r.json()));
    }

    getFunctionAppAzureAppSettings(context: FunctionAppContext) {
        return this.azure.executeWithConditions([], context, t =>
            this._cacheService.postArm(`${context.site.id}/config/appsettings/list`, true)
                .map(r => r.json() as ArmObj<{ [key: string]: string }>));
    }

    createFunctionV2(context: FunctionAppContext, functionName: string, files: any, config: any) {
        const filesCopy = Object.assign({}, files);
        const sampleData = filesCopy['sample.dat'];
        delete filesCopy['sample.dat'];

        const content = JSON.stringify({ files: filesCopy, test_data: sampleData, config: config });
        const url = context.urlTemplates.getFunctionUrl(functionName);

        return this.getClient(context).executeWithConditions([], context, t => {
            const headers = this.jsonHeaders(t);
            return this._cacheService.put(url, headers, content).map(r => r.json() as FunctionInfo)
                .do(() => {
                    this._cacheService.clearCachePrefix(context.urlTemplates.scmSiteUrl);
                });
        });
    }

    statusCodeToText(code: number) {
        const statusClass = Math.floor(code / 100) * 100;
        return HttpConstants.statusCodeMap[code] || HttpConstants.genericStatusCodeMap[statusClass] || 'Unknown Status Code';
    }

    runHttpFunction(context: FunctionAppContext, functionInfo: FunctionInfo, url: string, model: HttpRunModel): Result<RunFunctionResult> {
        return this.runtime.executeWithConditions([], context, token => {
            const content = model.body;

            const regExp = /\{([^}]+)\}/g;
            const matchesPathParams = url.match(regExp);
            const processedParams = [];

            const splitResults = url.split('?');
            if (splitResults.length === 2) {
                url = splitResults[0];
            }

            if (matchesPathParams) {
                matchesPathParams.forEach((m) => {
                    const name = m.split(':')[0].replace('{', '').replace('}', '');
                    processedParams.push(name);
                    const param = model.queryStringParams.find((p) => {
                        return p.name === name;
                    });
                    if (param) {
                        url = url.replace(m, param.value);
                    }
                });
            }

            let queryString = '';
            if (model.code) {
                queryString = `?${model.code.name}=${model.code.value}`;
            }
            model.queryStringParams.forEach(p => {
                const findResult = processedParams.find((pr) => {
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
            const inputBinding = (functionInfo.config && functionInfo.config.bindings
                ? functionInfo.config.bindings.find(e => e.type === 'httpTrigger')
                : null);

            let contentType: string;
            if (!inputBinding || inputBinding && inputBinding.webHookType) {
                contentType = 'application/json';
            }

            const headers = this.headers(token);
            if (contentType) {
                headers.append('Content-Type', contentType);
            }

            model.headers.forEach((h) => {
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

        return this.runtime.executeWithConditions([], context, t =>
            this.runFunctionInternal(context, this._cacheService.post(url, true, this.headers(t, ['Content-Type', contentType]), _content), functionInfo));
    }

    deleteFunction(context: FunctionAppContext, functionInfo: FunctionInfo): Result<void> {
        return this.getClient(context).execute(context, t =>
            this._cacheService.delete(functionInfo.href, this.jsonHeaders(t)));
        // .concatMap(r => this.getRuntimeGeneration())
        // .concatMap((runtimeVersion: string) => {
        //     return runtimeVersion === 'V2'
        //         ? this.updateDisabledAppSettings([functionInfo])
        //         : Observable.of(null);
        // }));
    }

    // TODO: [ahmels] change to Result<T>
    updateDisabledAppSettings(context: FunctionAppContext, infos: FunctionInfo[]): Observable<any> {
        if (infos.length > 0) {
            return this._cacheService.postArm(`${context.site.id}/config/appsettings/list`, true)
                .flatMap(r => {
                    const appSettings: ArmObj<any> = r.json();
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

                    return needToUpdate ? this._cacheService.putArm(appSettings.id, null, appSettings) : Observable.of(null);
                });
        } else {
            return Observable.of(null);
        }
    }

    getHostJson(context: FunctionAppContext): Result<Host> {
        return this.getClient(context).execute(context, t =>
            this._cacheService.get(context.urlTemplates.hostJsonUrl, false, this.headers(t)).map(r => r.json()));
    }

    saveFunction(context: FunctionAppContext, fi: FunctionInfo, config: any) {
        this._cacheService.clearCachePrefix(context.scmUrl);
        this._cacheService.clearCachePrefix(context.mainSiteUrl);
        return this.getClient(context).execute(context, t =>
            this._cacheService.put(fi.href, this.jsonHeaders(t), JSON.stringify({ config: config })).map(r => r.json() as FunctionInfo));
    }

    getHostToken(context: FunctionAppContext) {
        return ArmUtil.isLinuxApp(context.site)
            ? this.azure.executeWithConditions([], context, t =>
                this._cacheService.get(Constants.serviceHost + `api/runtimetoken${context.site.id}`, false, this.portalHeaders(t)))
            : this.azure.execute(context, t =>
                this._cacheService.get(context.urlTemplates.scmTokenUrl, false, this.headers(t)));
    }

    getHostKeys(context: FunctionAppContext): Result<FunctionKeys> {
        return this.runtime.execute(context, t =>
            Observable.zip(
                this._cacheService.get(context.urlTemplates.adminKeysUrl, false, this.headers(t)),
                this._cacheService.get(context.urlTemplates.masterKeyUrl, false, this.headers(t))
            )
                .map(r => {
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
                error: null
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
                    error: null
                });
            }
        } catch (e) {
            console.error(e);
        }

        return this.azure.execute(context, t => this.getExtensionVersionFromAppSettings(context)
            .concatMap(extensionVersion => {
                if (!extensionVersion) {
                    extensionVersion = 'latest';
                }

                const headers = this.portalHeaders(t);
                if(this._globalStateService.showTryView){
                    headers.delete('Authorization');
                }

                return this._cacheService.get(`${Constants.serviceHost}api/bindingconfig?runtime=${extensionVersion}`, false, headers)
            })
            .map(r => {
                const object = r.json();
                this.localize(object);
                return object as BindingConfig;
            }));
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
        return this.getClient(context).execute(context, t =>
            this._cacheService.put(fi.href, this.jsonHeaders(t), JSON.stringify(fiCopy))
                .map(r => r.json() as FunctionInfo));
    }

    getFunctionErrors(context: FunctionAppContext, fi: FunctionInfo, handleUnauthorized?: boolean): Result<string[]> {
        return this.runtime.execute(context, t =>
            this._cacheService.get(context.urlTemplates.getFunctionRuntimeErrorsUrl(fi.name), false, this.headers(t))
                .map(r => (r.json().errors || []) as string[]));
    }

    getHostErrors(context: FunctionAppContext): Result<string[]> {
        return this.runtime.execute(context, t =>
            this._cacheService.get(context.urlTemplates.runtimeStatusUrl, true, this.headers(t))
                .map(r => (r.json().errors || []) as string[]));
    }

    getFunctionHostStatus(context: FunctionAppContext): Result<HostStatus> {
        return this.runtime.execute(context, t =>
            this._cacheService.get(context.urlTemplates.runtimeStatusUrl, true, this.headers(t))
                .map(r => r.json() as HostStatus));
    }

    getOldLogs(context: FunctionAppContext, fi: FunctionInfo, range: number): Result<string> {
        const url = context.urlTemplates.getFunctionLogUrl(fi.name);

        return this.getClient(context).execute(context, t =>
            this._cacheService.get(url, false, this.headers(t))
                .concatMap(r => {
                    let files: VfsObject[] = r.json();
                    if (files.length > 0) {
                        files = files
                            .map(e => Object.assign({}, e, { parsedTime: new Date(e.mtime) }))
                            .sort((a, b) => a.parsedTime.getTime() - b.parsedTime.getTime());

                        return this._cacheService.get(files.pop().href, false, this.headers(t, ['Range', `bytes=-${range}`]))
                            .map(f => {
                                const content = f.text();
                                const index = content.indexOf('\n');
                                return <string>(index !== -1
                                    ? content.substring(index + 1)
                                    : content);
                            });
                    } else {
                        return Observable.of('');
                    }
                }));
    }

    getVfsObjects(context: FunctionAppContext, fi: FunctionInfo | string): Result<VfsObject[]> {
        const href = typeof fi === 'string' ? fi : fi.script_root_path_href;
        return this.getClient(context).execute(context, t =>
            this._cacheService.get(href, false, this.headers(t)).map(e => <VfsObject[]>e.json()));
    }


    getFunctionKeys(context: FunctionAppContext, functionInfo: FunctionInfo): Result<FunctionKeys> {
        return this.runtime.execute(context, t =>
            this._cacheService.get(context.urlTemplates.getFunctionKeysUrl(functionInfo.name), false, this.headers(t))
                .map(r => r.json() as FunctionKeys));
    }

    createKey(
        context: FunctionAppContext,
        keyName: string,
        keyValue: string,
        functionInfo?: FunctionInfo): Result<FunctionKey> {
        this.clearKeysCache(context, functionInfo);

        const url = functionInfo
            ? context.urlTemplates.getFunctionKeyUrl(functionInfo.name, keyName)
            : context.urlTemplates.getAdminKeyUrl(keyName);

        const body = keyValue
            ? JSON.stringify({
                name: keyName,
                value: keyValue
            })
            : null;

        return this.runtime.execute(context, t => {
            const req = body
                ? this._cacheService.put(url, this.jsonHeaders(t), body)
                : this._cacheService.post(url, true, this.jsonHeaders(t));
            return req.map(r => r.json() as FunctionKey);
        });
    }

    deleteKey(
        context: FunctionAppContext,
        key: FunctionKey,
        functionInfo?: FunctionInfo): Result<void> {
        this.clearKeysCache(context, functionInfo);

        const url = functionInfo
            ? context.urlTemplates.getFunctionKeyUrl(functionInfo.name, key.name)
            : context.urlTemplates.getAdminKeyUrl(key.name);

        return this.runtime.execute(context, t => this._cacheService.delete(url, this.jsonHeaders(t)));
    }

    renewKey(context: FunctionAppContext, key: FunctionKey, functionInfo?: FunctionInfo): Result<FunctionKey> {
        this.clearKeysCache(context, functionInfo);

        const url = functionInfo
            ? context.urlTemplates.getFunctionKeyUrl(functionInfo.name, key.name)
            : context.urlTemplates.getAdminKeyUrl(key.name);

        return this.runtime.execute(context, t => this._cacheService.post(url, true, this.jsonHeaders(t)));
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
        const url = context.urlTemplates.syncTriggersUrl;
        this.azure.execute(context, t => this._cacheService.post(url, true, this.jsonHeaders(t)))
            .subscribe(success => console.log(success), error => console.log(error));
    }

    isSourceControlEnabled(context: FunctionAppContext): Result<boolean> {
        return this.azure.executeWithConditions([], context, this._cacheService.getArm(`${context.site.id}/config/web`)
            .map(r => {
                const config: ArmObj<SiteConfig> = r.json();
                return !config.properties['scmType'] || config.properties['scmType'] !== 'None';
            }));
    }


    isSlot(context: FunctionAppContext | string): boolean {
        // slots id looks like
        // /subscriptions/<subscriptionId>/resourceGroups/<resourceGroupName>/providers/Microsoft.Web/sites/<siteName>/slots/<slotName>
        // split('/')
        //  [
        //      0: "",
        //      1: "subscriptions",
        //      2: "<subscriptionId>",
        //      3: "resourceGroups",
        //      4: "<resourceGroupName>",
        //      5: "providers",
        //      6: "Microsoft.Web",
        //      7: "sites",
        //      8: "<siteName>",
        //      9: "slots:,
        //      10: "<slotName>"
        //  ]
        const id = typeof context === 'string' ? context : context.site.id;
        const siteSegments = id.split('/');
        return siteSegments.length === 11 && siteSegments[9].toLowerCase() === 'slots';
    }

    getSlotsList(context: FunctionAppContext | string): Result<ArmObj<Site>[]> {
        const id = typeof context === 'string' ? context : context.site.id;
        return this.isSlot(context)
            ? Observable.of({
                isSuccessful: true,
                result: [],
                error: null
            })
            : this.azure.executeWithConditions([], typeof context !== 'string' ? context : null, this._cacheService.getArm(`${id}/slots`)
                .map(r => r.json().value as ArmObj<Site>[]));
    }

    // TODO: [ahmels] change to Result<T>
    reachableInternalLoadBalancerApp(context: FunctionAppContext): Observable<boolean> {
        if (context && context.site &&
            context.site.properties.hostingEnvironmentProfile &&
            context.site.properties.hostingEnvironmentProfile.id) {
            return this._cacheService.getArm(context.site.properties.hostingEnvironmentProfile.id, false, '2016-09-01')
                .mergeMap(r => {
                    const ase: ArmObj<HostingEnvironment> = r.json();
                    if (ase.properties.internalLoadBalancingMode &&
                        ase.properties.internalLoadBalancingMode !== 'None') {
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

        return this.azure.executeWithConditions([], context,
            Observable.zip(
                this.isSourceControlEnabled(context),
                this.azure.executeWithConditions([], context, this._cacheService.postArm(`${context.site.id}/config/appsettings/list`, true)),
                this.isSlot(context)
                    ? Observable.of({ isSuccessful: true, result: true, error: null })
                    : this.getSlotsList(context).map(r => r.isSuccessful ? Object.assign(r, { result: r.result.length > 0 }) : r),
                this.getFunctions(context),
                (a, b, s, f) => ({ sourceControlEnabled: a, appSettingsResponse: b, hasSlots: s, functions: f }))
                .map(result => {
                    const appSettings: ArmObj<{ [key: string]: string }> = result.appSettingsResponse.isSuccessful
                        ? result.appSettingsResponse.result.json()
                        : null;

                    const sourceControlled = result.sourceControlEnabled.isSuccessful &&
                        result.sourceControlEnabled.result;

                    let editModeSettingString: string = appSettings ? appSettings.properties[Constants.functionAppEditModeSettingName] || '' : '';
                    editModeSettingString = editModeSettingString.toLocaleLowerCase();
                    const vsCreatedFunc = result.functions.isSuccessful
                        ? !!result.functions.result.find((fc: any) => !!fc.config.generatedBy)
                        : false;

                    if (vsCreatedFunc && (editModeSettingString === Constants.ReadOnlyMode || editModeSettingString === '')) {
                        return FunctionAppEditMode.ReadOnlyVSGenerated;
                    } else if (editModeSettingString === Constants.ReadWriteMode) {
                        return sourceControlled ? FunctionAppEditMode.ReadWriteSourceControlled : FunctionAppEditMode.ReadWrite;
                    } else if (editModeSettingString === Constants.ReadOnlyMode) {
                        return sourceControlled ? FunctionAppEditMode.ReadOnlySourceControlled : FunctionAppEditMode.ReadOnly;
                    } else if (sourceControlled) {
                        return FunctionAppEditMode.ReadOnlySourceControlled;
                    } else {
                        return result.hasSlots.result ? FunctionAppEditMode.ReadOnlySlots : FunctionAppEditMode.ReadWrite;
                    }
                })
                .catch(() => Observable.of(FunctionAppEditMode.ReadWrite)));
    }

    public getAuthSettings(context: FunctionAppContext): Result<AuthSettings> {
        return this.azure.executeWithConditions([], context, this._cacheService.postArm(`${context.site.id}/config/authsettings/list`)
            .map(r => {
                const auth: ArmObj<any> = r.json();
                return {
                    easyAuthEnabled: auth.properties['enabled'] && auth.properties['unauthenticatedClientAction'] !== 1,
                    AADConfigured: auth.properties['clientId'] || false,
                    AADNotConfigured: auth.properties['clientId'] ? false : true,
                    clientCertEnabled: context.site.properties.clientCertEnabled
                };
            }));
    }

    /**
     * This method just pings the root of the SCM site. It doesn't care about the response in anyway or use it.
     */
    pingScmSite(context: FunctionAppContext): Result<boolean> {
        return this.azure.execute(context, t =>
            this._cacheService.get(context.urlTemplates.pingScmSiteUrl, true, this.headers(t))
                .map(_ => true)
                .catch(() => Observable.of(false)));
    }

    private runFunctionInternal(context: FunctionAppContext, response: Observable<Response>, functionInfo: FunctionInfo) {
        return response
            .catch((e: Response) => {
                return this.getAuthSettings(context)
                    .map(r => r.isSuccessful ? r.result : { easyAuthEnabled: false, clientCertEnabled: false })
                    .mergeMap(authSettings => {
                        if (authSettings.easyAuthEnabled) {
                            return Observable.of({
                                status: 401,
                                statusText: this.statusCodeToText(401),
                                text: () => this._translateService.instant(PortalResources.functionService_authIsEnabled)
                            });
                        } else if (authSettings.clientCertEnabled) {
                            return Observable.of({
                                status: 401,
                                statusText: this.statusCodeToText(401),
                                text: () => this._translateService.instant(PortalResources.functionService_clientCertEnabled)
                            });
                        } else if (e.status === 200 && e.type === ResponseType.Error) {
                            return Observable.of({
                                status: 502,
                                statusText: this.statusCodeToText(502),
                                text: () => this._translateService.instant(PortalResources.functionService_errorRunningFunc, {
                                    name: functionInfo.name
                                })
                            });
                        } else if (e.status === 0 && e.type === ResponseType.Error) {
                            return Observable.of({
                                status: 0,
                                statusText: this.statusCodeToText(0),
                                text: () => ''
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
                                text: () => text
                            });
                        }
                    });
            })
            .map(r => <RunFunctionResult>({ statusCode: r.status, statusText: this.statusCodeToText(r.status), content: r.text() }));
    }

    getGeneratedSwaggerData(context: FunctionAppContext, key: string): Result<any> {
        const url: string = context.urlTemplates.getGeneratedSwaggerDataUrl;
        return this.runtime.execute(context, t => this._cacheService.get(`${url}?code=${key}`, false, this.headers(t)).map(r => r.json()));
    }

    getSwaggerDocument(context: FunctionAppContext, key: string): Result<any> {
        const url: string = context.urlTemplates.getSwaggerDocumentUrl;
        return this.runtime.execute(context, t => this._cacheService.get(`${url}?code=${key}`, false, this.headers(t)).map(r => r.json()));
    }

    addOrUpdateSwaggerDocument(context: FunctionAppContext, swaggerUrl: string, content: string): Result<any> {
        return this.runtime.execute(context, this._cacheService.post(swaggerUrl, false, this.jsonHeaders(null), content).map(r => r.json()));
    }

    deleteSwaggerDocument(context: FunctionAppContext, swaggerUrl: string) {
        return this.runtime.execute(context, this._cacheService.delete(swaggerUrl));
    }

    saveHostJson(context: FunctionAppContext, jsonString: string): Result<any> {
        return this.getClient(context).execute(context, t =>
            this._cacheService.put(context.urlTemplates.hostJsonUrl, this.jsonHeaders(t, ['If-Match', '*']), jsonString).map(r => r.json()));
    }

    createSystemKey(context: FunctionAppContext, keyName: string) {
        return this.runtime.execute(context, t => this._cacheService.post(context.urlTemplates.getSystemKeyUrl(keyName), true, this.jsonHeaders(t, ['If-Match', '*']))
            .map(r => r.json()));
    }

    // Try and the list of runtime extensions install.
    // If there was an error getting the list, show an error. return an empty list.
    getHostExtensions(context: FunctionAppContext): Result<any> {
        return this.runtime.execute(context, t =>
            this._cacheService.get(context.urlTemplates.runtimeHostExtensionsUrl, false, this.headers(t))
                .map(r => r.json() as FunctionKeys));
    }

    // TOOD: [soninaren] Capture 409
    // TODO: [soninaren] returns error object when resulted in error
    // TODO: [soninaren] error.id is not defined
    installExtension(context: FunctionAppContext, extension: RuntimeExtension): Result<ExtensionInstallStatus> {
        return this.runtime.execute(context, t =>
            this._cacheService.post(context.urlTemplates.runtimeHostExtensionsUrl, true, this.jsonHeaders(t), extension)
                .map(r => r.json() as ExtensionInstallStatus));
    }

    getExtensionInstallStatus(context: FunctionAppContext, jobId: string): Result<ExtensionInstallStatus> {
        return this.runtime.execute(context, t =>
            this._cacheService.get(context.urlTemplates.getRuntimeHostExtensionsJobStatusUrl(jobId), true, this.headers(t))
                .map(r => r.json() as ExtensionInstallStatus)
        );
    }

    getSystemKey(context: FunctionAppContext): Result<FunctionKeys> {
        return this.runtime.execute(context, t =>
            this._cacheService.get(context.urlTemplates.systemKeysUrl, false, this.headers(t))
                .map(r => r.json() as FunctionKeys));
    }

    getEventGridKey(context: FunctionAppContext): Result<string> {
        return this.getSystemKey(context)
            .map(result => {
                if (result.isSuccessful) {
                    const key = result.result.keys.find(k => k.name === Constants.eventGridName);
                    return {
                        isSuccessful: true,
                        result: key ? key.value : '',
                        error: null
                    };
                } else {
                    return result as any as FunctionAppHttpResult<string>;
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
            return this._cacheService.postArm(`${context.site.id}/config/authsettings/list`, true)
                .flatMap(r => {
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


    getAppContext(resourceId: string): Observable<FunctionAppContext> {
        return this._cacheService.getArm(resourceId)
            .map(r => ArmUtil.mapArmSiteToContext(r.json(), this._injector));
    }

    isAppInsightsEnabled(siteId: string) {
        const descriptor = new ArmSiteDescriptor(siteId);
        return Observable.zip(
            this._cacheService.postArm(`${siteId}/config/appsettings/list`),
            this._cacheService.getArm(`/subscriptions/${descriptor.subscription}/providers/microsoft.insights/components`, false, '2015-05-01'),
            (as, ai) => ({ appSettings: as, appInsights: ai }))
            .map(r => {
                const ikey = r.appSettings.json().properties[Constants.instrumentationKeySettingName];
                let result = null;
                if (ikey) {
                    const aiResources = r.appInsights.json();

                    // AI RP has an issue where they return an array instead of a JSON response if empty
                    if (aiResources && !Array.isArray(aiResources)) {
                        aiResources.value.forEach((ai) => {
                            if (ai.properties.InstrumentationKey === ikey) {
                                result = ai.id;
                            }
                        });
                    }
                }
                return result;
            });
    }

    // these 2 functions are only for try app service scenarios.
    // It's a hack to not have to change a lot of code since soon try will fork this anyway.
    // DO NOT use this for anything new.
    _tryFunctionsBasicAuthToken: string;
    setTryFunctionsToken(token: string) {
        this._tryFunctionsBasicAuthToken = token;
    }


    private localize(objectToLocalize: any): any {
        if ((typeof objectToLocalize === 'string') && (objectToLocalize.startsWith('$'))) {
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
            headers.set('Authorization', `Bearer ${authTokenOrHeader}`);
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
