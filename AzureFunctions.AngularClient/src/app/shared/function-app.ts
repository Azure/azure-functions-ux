import { Subject } from 'rxjs/Subject';
import { SlotsService } from './services/slots.service';
import { Http, Headers, Response, ResponseType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';

import { ConfigService } from './services/config.service';
import { NoCorsHttpService } from './no-cors-http-service';
import { ErrorIds } from './models/error-ids';
import { DiagnosticsResult } from './models/diagnostics-result';
import { WebApiException, FunctionRuntimeError } from './models/webapi-exception';
import { FunctionsResponse } from './models/functions-response';
import { AiService } from './services/ai.service';
import { AuthzService } from './services/authz.service';
import { LanguageService } from './services/language.service';
import { SiteConfig } from './models/arm/site-config';
import { FunctionInfo } from './models/function-info';
import { VfsObject } from './models/vfs-object';
import { ApiProxy } from './models/api-proxy';
import { CreateFunctionInfo } from './models/create-function-info';
import { FunctionTemplate } from './models/function-template';
import { DesignerSchema } from './models/designer-schema';
import { FunctionSecrets } from './models/function-secrets';
import { BindingConfig } from './models/binding';
import { UserService } from './services/user.service';
import { FunctionContainer } from './models/function-container';
import { RunFunctionResult } from './models/run-function-result';
import { Constants } from './models/constants';
import { Cache, ClearCache, ClearAllFunctionCache } from './decorators/cache.decorator';
import { GlobalStateService } from './services/global-state.service';
import { PortalResources } from './models/portal-resources';
import { UIResource, ITryAppServiceTemplate } from './models/ui-resource';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { BroadcastService } from './services/broadcast.service';
import { ArmService } from './services/arm.service';
import { BroadcastEvent } from './models/broadcast-event';
import { ErrorEvent, ErrorType } from './models/error-event';
import { HttpRunModel } from './models/http-run';
import { FunctionKeys, FunctionKey } from './models/function-key';
import { CacheService } from './services/cache.service';
import { ArmObj } from './models/arm/arm-obj';
import { Site } from './models/arm/site';
import { AuthSettings } from './models/auth-settings';
import { FunctionAppEditMode } from './models/function-app-edit-mode';
import { HostStatus } from './models/host-status';

import * as jsonschema from 'jsonschema';

export class FunctionApp {
    private masterKey: string;
    private token: string;
    private _scmUrl: string;
    private siteName: string;
    private mainSiteUrl: string;
    public selectedFunction: string;
    public selectedLanguage: string;
    public selectedProvider: string;
    public selectedFunctionName: string;

    public isMultiKeySupported = true;
    public isAlwaysOn = false;
    public isDeleted = false;
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
    private statusCodeMap = {
        0: 'Unknown HTTP Error',
        100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        306: '(Unused)',
        307: 'Temporary Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Request Entity Too Large',
        414: 'Request-URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Requested Range Not Satisfiable',
        417: 'Expectation Failed',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported'
    };

    private genericStatusCodeMap = {
        100: 'Informational',
        200: 'Success',
        300: 'Redirection',
        400: 'Client Error',
        500: 'Server Error'
    };

    private _tryAppServiceUrl = 'https://tryappservice.azure.com';
    public tryFunctionsScmCreds: string;
    private _http: NoCorsHttpService;

    constructor(
        public site: ArmObj<Site>,
        _ngHttp: Http,
        private _userService: UserService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        private _armService: ArmService,
        private _cacheService: CacheService,
        private _languageService: LanguageService,
        private _authZService: AuthzService,
        private _aiService: AiService,
        private _configService: ConfigService,
        private _slotsService: SlotsService) {

        this._http = new NoCorsHttpService(_ngHttp, _broadcastService, _aiService, _translateService, () => this.getPortalHeaders());

        if (!Constants.runtimeVersion) {
            this.getLatestRuntime().subscribe((runtime: any) => {
                Constants.runtimeVersion = runtime;
            });
        }

        if (!Constants.routingExtensionVersion) {
            this._getLatestRoutingExtensionVersion().subscribe((routingVersion: any) => {
                Constants.routingExtensionVersion = routingVersion;
            });
        }

        if (!_globalStateService.showTryView) {
            this._userService.getStartupInfo()
                .mergeMap(info => {
                    this.token = info.token;
                    return Observable.zip(
                        this._authZService.hasPermission(this.site.id, [AuthzService.writeScope]),
                        this._authZService.hasReadOnlyLock(this.site.id),
                        (p, l) => ({ hasWritePermissions: p, hasReadOnlyLock: l })
                    );
                })
                .mergeMap(r => {
                    if (r.hasWritePermissions && !r.hasReadOnlyLock) {
                        return this.getExtensionVersion();
                    }

                    return Observable.of(null);
                })
                .mergeMap(extensionVersion => {
                    if (extensionVersion) {
                        return this._languageService.getResources(extensionVersion);
                    }

                    return Observable.of(null);
                })
                .do(_ => {
                    this.diagnose(this.site)
                        .subscribe(diagnosticsResults => {
                            if (diagnosticsResults) {
                                for (let i = 0; i < diagnosticsResults.length; i++) {
                                    if (diagnosticsResults[i].isDiagnosingSuccessful) {
                                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                            message: `${diagnosticsResults[i].successResult.message} ${diagnosticsResults[i].successResult.userAction}`,
                                            errorId: diagnosticsResults[i].successResult.actionId,
                                            errorType: diagnosticsResults[i].successResult.isTerminating ? ErrorType.Fatal : ErrorType.UserError,
                                            resourceId: this.site.id
                                        });
                                    }
                                }
                            }
                        });
                }, e => {
                    this._aiService.trackException(e, 'FunctionApp().getStartupInfo()');
                })
                .subscribe(() => { });

        }

        this._scmUrl = FunctionApp.getScmUrl(this._configService, this.site);
        this.mainSiteUrl = FunctionApp.getMainUrl(this._configService, this.site);

        this.siteName = this.site.name;

        const fc = <FunctionContainer>site;
        if (fc.tryScmCred != null) {
            this.tryFunctionsScmCreds = fc.tryScmCred;
        }

        if (Cookie.get('TryAppServiceToken')) {
            this._globalStateService.TryAppServiceToken = Cookie.get('TryAppServiceToken');
            const templateId = Cookie.get('templateId');
            this.selectedFunction = templateId.split('-')[0].trim();
            this.selectedLanguage = templateId.split('-')[1].trim();
            this.selectedProvider = Cookie.get('provider');
            this.selectedFunctionName = Cookie.get('functionName');
        }
    }

    public static getMainUrl(configService: ConfigService, site: ArmObj<Site>) {
        if (configService.isStandalone()) {
            return `https://${site.properties.defaultHostName}/functions/${site.name}`;
        }
        else {
            return `https://${site.properties.defaultHostName}`;
        }
    }

    // In standalone mode, there isn't a concept of a separate SCM site.  Instead, all calls that would
    // normally go to the main or scm site are routed to a single server and are distinguished by either
    // "/api" (scm site) or "/admin" (main site)
    public static getScmUrl(configService: ConfigService, site: ArmObj<Site>) {
        if (configService.isStandalone()) {
            return FunctionApp.getMainUrl(configService, site);
        }
        else {
            return `https://${site.properties.hostNameSslStates.find(s => s.hostType === 1).name}`;
        }
    }

    private _getLatestRoutingExtensionVersion() {
        return this._cacheService.get(Constants.serviceHost + 'api/latestrouting', false, this.getPortalHeaders())
            .map(r => {
                return r.json();
            })
            .retryWhen(this.retryAntares);
    }

    getFunctions() {
        let fcs: FunctionInfo[];

        return this._cacheService.get(`${this._scmUrl}/api/functions`, false, this.getScmSiteHeaders())
            .catch(() => this._http.get(`${this._scmUrl}/api/functions`, { headers: this.getScmSiteHeaders() }))
            .retryWhen(this.retryAntares)
            .flatMap((r: Response) => {
                try {
                    fcs = r.json() as FunctionInfo[];
                    fcs.forEach(fc => fc.functionApp = this);
                    const vsCreatedFunc = fcs.find((fc: any) => !!fc.config.generatedBy);
                    return vsCreatedFunc
                        ? this.createApplicationSetting(Constants.functionAppEditModeSettingName, Constants.ReadOnlyMode, false)
                        : Observable.of(null);
                } catch (e) {
                    // We have seen this happen when kudu was returning JSON that contained
                    // comments because Json.NET is okay with comments in the JSON file.
                    // We can't parse that JSON in browser, so this is just to handle the error correctly.
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_parsingFunctionListReturenedFromKudu),
                        errorId: ErrorIds.deserializingKudusFunctionList,
                        errorType: ErrorType.Fatal,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.deserializingKudusFunctionList, {
                        error: e,
                        content: r.text(),
                    });
                    fcs = <FunctionInfo[]>[];
                    return Observable.of(null);
                }
            })
            .map(() => {
                return fcs;
            })
            .do(() => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRetrieveFunctionsList),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToRetrieveFunctionListFromKudu),
                        errorId: ErrorIds.unableToRetrieveFunctionsList,
                        errorType: ErrorType.RuntimeError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToRetrieveFunctionsList, {
                        content: error.text(),
                        status: error.status.toString()
                    });
                }
            });

    }

    getApiProxies() {
        return Observable.zip(
            this._cacheService.get(`${this._scmUrl}/api/vfs/site/wwwroot/proxies.json`, false, this.getScmSiteHeaders())
                .catch(() => this._http.get(`${this._scmUrl}/api/vfs/site/wwwroot/proxies.json`, { headers: this.getScmSiteHeaders() }))
                .retryWhen(e => e.scan((errorCount: number, err: Response) => {
                    if (err.status === 404 || errorCount >= 10) {
                        throw err;
                    }
                    return errorCount + 1;
                }, 0).delay(200))
                .catch(_ => Observable.of({
                    json: () => { return {}; }
                })),
            this._cacheService.get('assets/schemas/proxies.json', false, this.getPortalHeaders()),
            (p, s) => ({ proxies: p.json(), schema: s.json() })
        ).map(r => {
            if (r.proxies.proxies) {
                const validateResult = jsonschema.validate(r.proxies, r.schema).toString();

                if (validateResult) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: `${this._translateService.instant(PortalResources.error_schemaValidationProxies)}. ${validateResult}`,
                        errorId: ErrorIds.proxySchemaValidationFails,
                        errorType: ErrorType.Fatal,
                        resourceId: this.site.id
                    });
                    return ApiProxy.fromJson({});
                }
            }
            return ApiProxy.fromJson(r.proxies);
        });
    }

    saveApiProxy(jsonString: string) {
        const headers = this.getScmSiteHeaders();
        // https://github.com/projectkudu/kudu/wiki/REST-API
        headers.append('If-Match', '*');

        const uri = `${this._scmUrl}/api/vfs/site/wwwroot/proxies.json`;
        this._cacheService.clearCachePrefix(uri);

        return this._http.put(uri, jsonString, { headers: headers });
    }

    /**
     * This function returns the content of a file from kudu as a string.
     * @param file either a VfsObject or a string representing the file's href.
     */
    @Cache('href')
    getFileContent(file: VfsObject | string) {
        const fileHref = typeof file === 'string' ? file : file.href;
        const fileName = this.getFileName(file);
        return this._http.get(fileHref, { headers: this.getScmSiteHeaders() })
            .map(r => r.text())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRetrieveFileContent + fileName),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToGetFileContentFromKudu, { fileName: fileName }),
                        errorId: ErrorIds.unableToRetrieveFileContent + fileName,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToRetrieveFileContent, {
                        fileHref: fileHref,
                        content: error.text(),
                        status: error.status.toString()
                    });
                }
            });
    }

    @ClearCache('getFileContent', 'href')
    saveFile(file: VfsObject | string, updatedContent: string, functionInfo?: FunctionInfo) {
        const fileHref = typeof file === 'string' ? file : file.href;
        const fileName = this.getFileName(file);
        const headers = this.getScmSiteHeaders('plain/text');
        headers.append('If-Match', '*');

        if (functionInfo) {
            ClearAllFunctionCache(functionInfo);
        }

        return this._http.put(fileHref, updatedContent, { headers: headers })
            .map(() => file)
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToSaveFileContent + fileName),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToSaveFileContentThroughKudu, { fileName: fileName }),
                        errorId: ErrorIds.unableToSaveFileContent + fileName,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToSaveFileContent, {
                        fileHref: fileHref,
                        content: error.text(),
                        status: error.status.toString()
                    });
                }
            });
    }

    @ClearCache('getFileContent', 'href')
    deleteFile(file: VfsObject | string, functionInfo?: FunctionInfo) {
        const fileHref = typeof file === 'string' ? file : file.href;
        const fileName = this.getFileName(file);
        const headers = this.getScmSiteHeaders('plain/text');
        headers.append('If-Match', '*');

        if (functionInfo) {
            ClearAllFunctionCache(functionInfo);
        }

        return this._http.delete(fileHref, { headers: headers })
            .map(() => file)
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToDeleteFile + fileName),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToDeleteFileThroughKudu, { fileName: fileName }),
                        errorId: ErrorIds.unableToDeleteFile + fileName,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToDeleteFile, {
                        fileHref: fileHref,
                        content: error.text(),
                        status: error.status.toString()
                    });
                }
            });
    }

    ClearAllFunctionCache(functionInfo: FunctionInfo) {
        ClearAllFunctionCache(functionInfo);
    }

    // This function is special cased in the Cache() decorator by name to allow for dev scenarios.
    getTemplates() {
        try {
            if (localStorage.getItem('dev-templates')) {
                const devTemplate: FunctionTemplate[] = JSON.parse(localStorage.getItem('dev-templates'));
                this.localize(devTemplate);
                return Observable.of(devTemplate);
            }
        } catch (e) {
            console.error(e);
        }

        return this.getExtensionVersion()
            .mergeMap(extensionVersion => {
                return this._cacheService.get(
                    Constants.serviceHost + 'api/templates?runtime=' + (extensionVersion || 'latest'),
                    true,
                    this.getPortalHeaders());
            })
            .retryWhen(this.retryAntares)
            .map(r => {
                const object = r.json();
                this.localize(object);
                return object;
            });
    }

    @ClearCache('getFunctions')
    createFunction(functionName: string, templateId: string) {
        let observable: Observable<FunctionInfo>;
        if (templateId) {
            const body: CreateFunctionInfo = {
                name: functionName,
                templateId: (templateId && templateId !== 'Empty' ? templateId : null),
                containerScmUrl: this._scmUrl
            };
            observable = this._http.put(`${this._scmUrl}/api/functions/${functionName}`, JSON.stringify(body), { headers: this.getScmSiteHeaders() })
                .map(r => r.json());
        } else {
            observable = this._http
                .put(`${this._scmUrl}/api/functions/${functionName}`, JSON.stringify({ config: {} }), { headers: this.getScmSiteHeaders() })
                .map(r => r.json());
        }

        return observable
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToCreateFunction + functionName),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToCreateFunction, { functionName: functionName }),
                        errorId: ErrorIds.unableToCreateFunction + functionName,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToCreateFunction, {
                        content: error.text(),
                        status: error.status.toString(),
                    });
                }
            });
    }

    getFunctionContainerAppSettings() {
        const url = `${this._scmUrl}/api/settings`;
        return this._http.get(url, { headers: this.getScmSiteHeaders() })
            .retryWhen(this.retryAntares)
            .map(r => <{ [key: string]: string }>r.json());
    }

    @ClearCache('getFunctions')
    createFunctionV2(functionName: string, files: any, config: any) {
        const filesCopy = Object.assign({}, files);
        const sampleData = filesCopy['sample.dat'];
        delete filesCopy['sample.dat'];

        const content = JSON.stringify({ files: filesCopy, test_data: sampleData, config: config });
        const url = `${this._scmUrl}/api/functions/${functionName}`;

        return this._http.put(url, content, { headers: this.getScmSiteHeaders() })
            .map(r => <FunctionInfo>r.json())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToCreateFunction + functionName),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToCreateFunction, { functionName: functionName }),
                        errorId: ErrorIds.unableToCreateFunction + functionName,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToCreateFunction, {
                        content: error.text(),
                        status: error.status.toString(),
                    });
                }
            });
    }

    getNewFunctionNode(): FunctionInfo {
        return {
            name: this._translateService.instant(PortalResources.newFunction),
            href: null,
            config: null,
            script_href: null,
            template_id: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null,
            test_data: null,
            script_root_path_href: null,
            config_href: null,
            functionApp: null
        };
    }

    statusCodeToText(code: number) {
        const statusClass = Math.floor(code / 100) * 100;
        return this.statusCodeMap[code] || this.genericStatusCodeMap[statusClass] || 'Unknown Status Code';
    }

    runHttpFunction(functionInfo: FunctionInfo, url: string, model: HttpRunModel) {
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

        let firstDone = false;
        model.queryStringParams.forEach(p => {
            const findResult = processedParams.find((pr) => {
                return pr === p.name;
            });

            if (!findResult) {
                if (!firstDone) {
                    url += '?';
                    firstDone = true;
                } else {
                    url += '&';
                }
                url += p.name + '=' + p.value;
            }
        });
        const inputBinding = (functionInfo.config && functionInfo.config.bindings
            ? functionInfo.config.bindings.find(e => e.type === 'httpTrigger')
            : null);

        let contentType: string;
        if (!inputBinding || inputBinding && inputBinding.webHookType) {
            contentType = 'application/json';
        }

        const headers = this.getMainSiteHeaders(contentType);
        model.headers.forEach((h) => {
            headers.append(h.name, h.value);
        });

        let response: Observable<Response>;
        switch (model.method) {
            case Constants.httpMethods.GET:
                response = this._http.get(url, { headers: headers });
                break;
            case Constants.httpMethods.POST:
                response = this._http.post(url, content, { headers: headers });
                break;
            case Constants.httpMethods.DELETE:
                response = this._http.delete(url, { headers: headers });
                break;
            case Constants.httpMethods.HEAD:
                response = this._http.head(url, { headers: headers });
                break;
            case Constants.httpMethods.PATCH:
                response = this._http.patch(url, content, { headers: headers });
                break;
            case Constants.httpMethods.PUT:
                response = this._http.put(url, content, { headers: headers });
                break;
            default:
                response = this._http.request(url, {
                    headers: headers,
                    method: model.method,
                    body: content
                });
                break;
        }

        return this.runFunctionInternal(response, functionInfo);
    }

    runFunction(functionInfo: FunctionInfo, content: string) {
        const url = `${this.mainSiteUrl}/admin/functions/${functionInfo.name.toLocaleLowerCase()}`;
        const _content: string = JSON.stringify({ input: content });
        let contentType: string;

        try {
            JSON.parse(_content);
            contentType = 'application/json';
        } catch (e) {
            contentType = 'plain/text';
        }


        return this.runFunctionInternal(
            this._http.post(url, _content, { headers: this.getMainSiteHeaders(contentType) }),
            functionInfo);

    }

    @ClearCache('clearAllCachedData')
    deleteFunction(functionInfo: FunctionInfo) {
        return this._http.delete(functionInfo.href, { headers: this.getScmSiteHeaders() })
            .map(r => r.statusText)
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToDeleteFunction + functionInfo.name),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToDeleteFunction, { functionName: functionInfo.name }),
                        errorId: ErrorIds.unableToDeleteFunction + functionInfo.name,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToDeleteFunction, {
                        content: error.text(),
                        status: error.status.toString(),
                        href: functionInfo.href
                    });
                }
            });
    }

    @Cache()
    getDesignerSchema() {
        return this._http.get(Constants.serviceHost + 'mocks/function-json-schema.json')
            .retryWhen(this.retryAntares)
            .map(r => <DesignerSchema>r.json());
    }

    initKeysAndWarmupMainSite() {
        const warmupSite = this._http.post(`${this.mainSiteUrl}/admin/host/ping`, '')
            .retryWhen(this.retryAntares)
            .catch(() => Observable.of(null));

        const observable = Observable.zip(
            warmupSite,
            this.getHostSecretsFromScm(),
            (w: any, s: any) => ({ warmUp: w, secrets: s })
        );

        return observable;
    }

    @Cache('secrets_file_href')
    getSecrets(fi: FunctionInfo) {
        return this._http.get(fi.secrets_file_href, { headers: this.getScmSiteHeaders() })
            .map(r => <FunctionSecrets>r.json())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRetrieveSecretsFileFromKudu + fi.name),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_UnableToRetrieveSecretsFileFromKudu, { functionName: fi.name }),
                        errorId: ErrorIds.unableToRetrieveSecretsFileFromKudu + fi.name,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToRetrieveSecretsFileFromKudu, {
                        status: error.status.toString(),
                        content: error.text(),
                        href: fi.secrets_file_href
                    });
                }
            });
    }

    @ClearCache('getSecrets', 'secrets_file_href')
    setSecrets(fi: FunctionInfo, secrets: FunctionSecrets) {
        return this.saveFile(fi.secrets_file_href, JSON.stringify(secrets))
            .retryWhen(this.retryAntares)
            .map(() => <FunctionSecrets>secrets);
    }

    getHostJson(): Observable<any> {
        return this._http.get(`${this._scmUrl}/api/functions/config`, { headers: this.getScmSiteHeaders() })
            .map(r => r.json())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRetrieveRuntimeConfig),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToRetrieveRuntimeConfig),
                        errorId: ErrorIds.unableToRetrieveRuntimeConfig,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToRetrieveRuntimeConfig, {
                        status: error.status.toString(),
                        content: error.text(),
                    });
                }
            });
    }

    @ClearCache('getFunction', 'href')
    saveFunction(fi: FunctionInfo, config: any) {
        ClearAllFunctionCache(fi);
        return this._http.put(fi.href, JSON.stringify({ config: config }), { headers: this.getScmSiteHeaders() })
            .map(r => <FunctionInfo>r.json())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToUpdateFunction + fi.name),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToUpdateFunction, { functionName: fi.name }),
                        errorId: ErrorIds.unableToUpdateFunction + fi.name,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToUpdateFunction, {
                        status: error.status.toString(),
                        content: error.text(),
                    });
                }
            });
    }

    getScmUrl() {
        return this._scmUrl;
    }

    getSiteName() {
        return this.siteName;
    }

    getMainSiteUrl(): string {
        return this.mainSiteUrl;
    }

    getHostSecretsFromScm() {
        return this.getAuthSettings()
            .mergeMap(authSettings => {
                return authSettings.clientCertEnabled
                    ? Observable.of()
                    : this._http.get(`${this._scmUrl}/api/functions/admin/token`, { headers: this.getScmSiteHeaders() })
                        .retryWhen(this.retryAntares)
                        .map(r => r.json())
                        .mergeMap((token: string) => {
                            // Call the main site to get the masterKey
                            // build authorization header
                            const authHeader = new Headers();
                            authHeader.append('Authorization', `Bearer ${token}`);
                            return this._http.get(`${this.mainSiteUrl}/admin/host/systemkeys/_master`, { headers: authHeader })
                                .catch((error: FunctionsResponse) => {
                                    if (error.status === 405) {
                                        // If the result from calling the API above is 405, that means they are running on an older runtime.
                                        // It should be safe to call kudu for the master key since they won't be using slots.
                                        return this._http.get(`${this._scmUrl}/api/functions/admin/masterKey`, { headers: this.getScmSiteHeaders() });
                                    } else {
                                        throw error;
                                    }
                                })
                                .retryWhen(error => error.scan((errorCount: number, err: FunctionsResponse) => {
                                    if (err.isHandled || err.status < 500 || errorCount >= 10) {
                                        throw err;
                                    } else {
                                        return errorCount + 1;
                                    }
                                }, 0).delay(1000))
                                .catch(e => this._http.get(`${this.mainSiteUrl}/admin/host/status`, { headers: authHeader })
                                    .do(null, _ => this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                        message: this._translateService.instant(PortalResources.error_functionRuntimeIsUnableToStart),
                                        errorId: ErrorIds.functionRuntimeIsUnableToStart,
                                        errorType: ErrorType.Fatal,
                                        resourceId: this.site.id
                                    })).map(_ => { throw e; })) // if /status call is successful, then throw the original error
                                .do((r: Response) => {
                                    // Since we fall back to kudu above, use a union of kudu and runtime types.
                                    const key: { name: string, value: string } & { masterKey: string } = r.json();
                                    if (key.masterKey) {
                                        this.masterKey = key.masterKey;
                                    } else {
                                        this.masterKey = key.value;
                                    }
                                });
                        })
                        .do(() => {
                            this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRetrieveRuntimeKeyFromScm);
                        },
                        (error: FunctionsResponse) => {
                            if (!error.isHandled) {
                                try {
                                    const exception: WebApiException & FunctionRuntimeError = error.json();
                                    if (exception.ExceptionType === 'System.Security.Cryptography.CryptographicException') {
                                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                            message: this._translateService.instant(PortalResources.error_unableToDecryptKeys),
                                            errorId: ErrorIds.unableToDecryptKeys,
                                            errorType: ErrorType.RuntimeError,
                                            resourceId: this.site.id
                                        });
                                        this.trackEvent(ErrorIds.unableToDecryptKeys, {
                                            content: error.text(),
                                            status: error.status.toString()
                                        });
                                        return;
                                    } else if (exception.message || exception.messsage) {
                                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                            message: exception.message || exception.messsage,
                                            errorId: ErrorIds.unableToDecryptKeys,
                                            errorType: ErrorType.RuntimeError,
                                            resourceId: this.site.id
                                        });
                                        this.trackEvent(ErrorIds.unableToDecryptKeys, {
                                            content: error.text(),
                                            status: error.status.toString()
                                        });
                                        return;
                                    }
                                } catch (e) {
                                    // no-op
                                }
                                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                    message: this._translateService.instant(PortalResources.error_unableToRetrieveRuntimeKey),
                                    errorId: ErrorIds.unableToRetrieveRuntimeKeyFromScm,
                                    errorType: ErrorType.RuntimeError,
                                    resourceId: this.site.id
                                });
                                this.trackEvent(ErrorIds.unableToRetrieveRuntimeKeyFromScm, {
                                    status: error.status.toString(),
                                    content: error.text(),
                                });
                            }
                        });
            });
    }

    legacyGetHostSecrets() {
        return this._http.get(`${this._scmUrl}/api/vfs/data/functions/secrets/host.json`, { headers: this.getScmSiteHeaders() })
            .map(r => <string>r.json().masterKey)
            .do(h => {
                this.masterKey = h;
                this.isMultiKeySupported = false;
            });
    }

    getFunctionHostKeys(handleUnauthorized?: boolean): Observable<FunctionKeys> {
        handleUnauthorized = typeof handleUnauthorized !== 'undefined' ? handleUnauthorized : true;
        return this.getAuthSettings()
            .mergeMap(r => {
                if (r.clientCertEnabled) {
                    return Observable.of({ keys: [], links: [] });
                }
                return this._http.get(`${this.mainSiteUrl}/admin/host/keys`, { headers: this.getMainSiteHeaders() })
                    .retryWhen(e => e.scan((errorCount: number, err: Response) => {
                        if (err.status < 500 && err.status !== 0) {
                            throw err;
                        }
                        if (errorCount >= 10) {
                            throw err;
                        }
                        return errorCount + 1;
                    }, 0).delay(400))
                    .map(r => {
                        const keys: FunctionKeys = r.json();
                        if (keys && Array.isArray(keys.keys)) {
                            keys.keys.unshift({
                                name: '_master',
                                value: this.masterKey
                            });
                        }
                        return keys;
                    })
                    .catch((error: Response) => {
                        if (handleUnauthorized && error.status === 401) {
                            this.trackEvent(ErrorIds.unauthorizedTalkingToRuntime, {
                                usedKey: this.sanitize(this.masterKey)
                            });
                            return this.getHostSecretsFromScm().mergeMap(() => this.getFunctionHostKeys(false));
                        } else {
                            throw error;
                        }
                    })
                    .do(_ => {
                        this.isMultiKeySupported = true;
                        this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRetrieveRuntimeKeyFromRuntime);
                    },
                    (error: FunctionsResponse) => {
                        if (!error.isHandled) {
                            if (error.status === 404) {
                                this.isMultiKeySupported = false;
                                this.legacyGetHostSecrets();
                            }

                            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                message: this._translateService.instant(PortalResources.error_unableToRetrieveRuntimeKey),
                                errorId: ErrorIds.unableToRetrieveRuntimeKeyFromRuntime,
                                errorType: ErrorType.RuntimeError,
                                resourceId: this.site.id
                            });

                            this.trackEvent(ErrorIds.unableToRetrieveRuntimeKeyFromRuntime, {
                                status: error.status.toString(),
                                content: error.text(),
                            });
                        }
                    });
            });
    }

    getBindingConfig(): Observable<BindingConfig> {
        try {
            if (localStorage.getItem('dev-bindings')) {
                const devBindings: BindingConfig = JSON.parse(localStorage.getItem('dev-bindings'));
                this.localize(devBindings);
                return Observable.of(devBindings);
            }
        } catch (e) {
            console.error(e);
        }

        return this.getExtensionVersion()
            .mergeMap(extensionVersion => {
                return this._cacheService.get(Constants.serviceHost + 'api/bindingconfig?runtime=' + extensionVersion, false, this.getPortalHeaders());
            })
            .retryWhen(this.retryAntares)
            .map(r => {
                const object = r.json();
                this.localize(object);
                return <BindingConfig>object;
            });
    }

    get HostSecrets() {
        return this.masterKey;
    }

    getTrialResource(provider?: string): Observable<UIResource> {
        const url = this._tryAppServiceUrl + '/api/resource?appServiceName=Function'
            + (provider ? '&provider=' + provider : '');

        return this._http.get(url, { headers: this.getTryAppServiceHeaders() })
            .retryWhen(this.retryGetTrialResource)
            .map(r => <UIResource>r.json());
    }

    createTrialResource(selectedTemplate: FunctionTemplate, provider: string, functionName: string): Observable<UIResource> {
        const url = this._tryAppServiceUrl + '/api/resource?appServiceName=Function'
            + (provider ? '&provider=' + provider : '')
            + '&templateId=' + encodeURIComponent(selectedTemplate.id)
            + '&functionName=' + encodeURIComponent(functionName);

        const template = <ITryAppServiceTemplate>{
            name: selectedTemplate.id,
            appService: 'Function',
            language: selectedTemplate.metadata.language,
            githubRepo: ''
        };

        return this._http.post(url, JSON.stringify(template), { headers: this.getTryAppServiceHeaders() })
            .retryWhen(this.retryCreateTrialResource)
            .map(r => <UIResource>r.json());
    }

    updateFunction(fi: FunctionInfo) {
        ClearAllFunctionCache(fi);
        const fiCopy = <FunctionInfo>{};
        for (const prop in fi) {
            if (fi.hasOwnProperty(prop) && prop !== 'functionApp') {
                fiCopy[prop] = fi[prop];
            }
        }
        return this._http.put(fi.href, JSON.stringify(fiCopy), { headers: this.getScmSiteHeaders() })
            .map(r => <FunctionInfo>r.json())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToUpdateFunction + fi.name),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToUpdateFunction, { functionName: fi.name }),
                        errorId: ErrorIds.unableToUpdateFunction + fi.name,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToUpdateFunction, {
                        status: error.status.toString(),
                        content: error.text(),
                    });
                }
            });
    }

    getFunctionErrors(fi: FunctionInfo, handleUnauthorized?: boolean) {
        handleUnauthorized = typeof handleUnauthorized !== 'undefined' ? handleUnauthorized : true;
        return this.getAuthSettings()
            .mergeMap((authSettings: AuthSettings) => {
                return authSettings.clientCertEnabled
                    ? Observable.of([])
                    : this._http.get(`${this.mainSiteUrl}/admin/functions/${fi.name}/status`, { headers: this.getMainSiteHeaders() })
                        .retryWhen(this.retryAntares)
                        .map(r => <string[]>(r.json().errors || []))
                        .catch((error: Response) => {
                            if (handleUnauthorized && error.status === 401) {
                                this.trackEvent(ErrorIds.unauthorizedTalkingToRuntime, {
                                    usedKey: this.sanitize(this.masterKey)
                                });
                                return this.getHostSecretsFromScm().mergeMap(() => this.getFunctionErrors(fi, false));
                            } else {
                                throw error;
                            }
                        })
                        .catch(() => Observable.of(null));
            });
    }

    getHostErrors(handleUnauthorized?: boolean): Observable<string[]> {
        handleUnauthorized = typeof handleUnauthorized !== 'undefined' ? handleUnauthorized : true;
        return this.getAuthSettings()
            .mergeMap(authSettings => {
                if (authSettings.clientCertEnabled || !this.masterKey) {
                    return Observable.of([]);
                } else {
                    return this._http.get(`${this.mainSiteUrl}/admin/host/status`, { headers: this.getMainSiteHeaders() })
                        .retryWhen(e => e.scan((errorCount: number, err: FunctionsResponse) => {
                            // retry 12 times with 5 seconds delay. This would retry for 1 minute before throwing.
                            if (errorCount >= 10 || err.status === 401) {
                                throw err;
                            }
                            return errorCount + 1;
                        }, 0).delay(2000))
                        .map(r => <string[]>(r.json().errors || []))
                        .catch((error: Response) => {
                            if (handleUnauthorized && error.status === 401) {
                                this.trackEvent(ErrorIds.unauthorizedTalkingToRuntime, {
                                    usedKey: this.sanitize(this.masterKey)
                                });
                                return this.getHostSecretsFromScm().mergeMap(() => this.getHostErrors(false));
                            } else {
                                throw error;
                            }
                        })
                        .do(() => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.functionRuntimeIsUnableToStart),
                        (error: FunctionsResponse) => {
                            if (!error.isHandled) {
                                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                    message: this._translateService.instant(PortalResources.error_functionRuntimeIsUnableToStart),
                                    errorId: ErrorIds.functionRuntimeIsUnableToStart,
                                    errorType: ErrorType.RuntimeError,
                                    resourceId: this.site.id
                                });
                                this.trackEvent(ErrorIds.functionRuntimeIsUnableToStart, {
                                    status: error.status.toString(),
                                    content: error.text(),
                                });
                            }
                        });
                }
            });
    }

    getFunctionHostStatus(handleUnauthorized?: boolean): Observable<HostStatus> {
        handleUnauthorized = typeof handleUnauthorized !== 'undefined' ? handleUnauthorized : true;
        return this.getAuthSettings()
            .mergeMap(authSettings => {
                if (authSettings.clientCertEnabled || !this.masterKey) {
                    return Observable.of(null);
                } else {
                    return this._http.get(`${this.mainSiteUrl}/admin/host/status`, { headers: this.getMainSiteHeaders() })
                        .map(r => (r.json()))
                        .catch((error: Response) => {
                            if (handleUnauthorized && error.status === 401) {
                                this.trackEvent(ErrorIds.unauthorizedTalkingToRuntime, {
                                    usedKey: this.sanitize(this.masterKey)
                                });
                                return this.getHostSecretsFromScm().mergeMap(() => this.getFunctionHostStatus(false));
                            } else {
                                throw error;
                            }
                        })
                        .catch(() => Observable.of(null));
                }
            });
    }

    // getFunctionAppArmId() {
    //    if (this.functionContainer && this.functionContainer.id && this.functionContainer.id.trim().length !== 0) {
    //        return this.functionContainer.id;
    //    } else if (this._scmUrl) {
    //        return this._scmUrl;
    //    } else {
    //        return 'Unknown';
    //    }
    // }

    getOldLogs(fi: FunctionInfo, range: number): Observable<string> {
        const url = `${this._scmUrl}/api/vfs/logfiles/application/functions/function/${fi.name}/`;
        return this._http.get(url, { headers: this.getScmSiteHeaders() })
            .catch(() => Observable.of({ json: () => [] }))
            .mergeMap(r => {
                const files: any[] = r.json();
                if (files.length > 0) {
                    const headers = this.getScmSiteHeaders();
                    headers.append('Range', `bytes=-${range}`);

                    files
                        .map(e => { e.parsedTime = new Date(e.mtime); return e; })
                        .sort((a, b) => a.parsedTime.getTime() - b.parsedTime.getTime());

                    return this._http.get(files.pop().href, { headers: headers })
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
            });
    }

    @Cache('href')
    getVfsObjects(fi: FunctionInfo | string) {
        const href = typeof fi === 'string' ? fi : fi.script_root_path_href;
        return this._http.get(href, { headers: this.getScmSiteHeaders() })
            .map(e => <VfsObject[]>e.json())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRetrieveDirectoryContent),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToRetrieveDirectoryContent),
                        errorId: ErrorIds.unableToRetrieveDirectoryContent,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToRetrieveDirectoryContent, {
                        content: error.text(),
                        status: error.status.toString()
                    });
                }
            });
    }

    @ClearCache('clearAllCachedData')
    clearAllCachedData() { }

    getLatestRuntime() {
        return this._http.get(Constants.serviceHost + 'api/latestruntime', { headers: this.getPortalHeaders() })
            .map(r => {
                return r.json();
            })
            .retryWhen(this.retryAntares);
    }

    getFunctionKeys(functionInfo: FunctionInfo, handleUnauthorized?: boolean): Observable<FunctionKeys> {
        handleUnauthorized = typeof handleUnauthorized !== 'undefined' ? handleUnauthorized : true;
        return this.getAuthSettings()
            .mergeMap(authSettings => {
                if (authSettings.clientCertEnabled) {
                    return Observable.of({ keys: [], links: [] });
                }
                return this._http.get(`${this.mainSiteUrl}/admin/functions/${functionInfo.name}/keys`, { headers: this.getMainSiteHeaders() })
                    .retryWhen(error => error.scan((errorCount: number, err: FunctionsResponse) => {
                        if (err.isHandled || (err.status < 500 && err.status !== 404) || errorCount >= 10) {
                            throw err;
                        } else {
                            return errorCount + 1;
                        }
                    }, 0).delay(1000))
                    .map(r => <FunctionKeys>r.json())
                    .catch((error: Response) => {
                        if (handleUnauthorized && error.status === 401) {
                            this.trackEvent(ErrorIds.unauthorizedTalkingToRuntime, {
                                usedKey: this.sanitize(this.masterKey)
                            });
                            return this.getHostSecretsFromScm().mergeMap(() => this.getFunctionKeys(functionInfo, false));
                        } else {
                            throw error;
                        }
                    })
                    .do(() => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRetrieveFunctionKeys + functionInfo.name),
                    (error: FunctionsResponse) => {
                        if (!error.isHandled) {
                            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                message: this._translateService.instant(PortalResources.error_unableToRetrieveFunctionKeys, { functionName: functionInfo.name }),
                                errorId: ErrorIds.unableToRetrieveFunctionKeys + functionInfo.name,
                                errorType: ErrorType.RuntimeError,
                                resourceId: this.site.id
                            });
                            this.trackEvent(ErrorIds.unableToRetrieveFunctionKeys, {
                                status: error.status.toString(),
                                content: error.text(),
                                functionName: functionInfo.name
                            });
                        }
                    });
            });
    }

    createKey(keyName: string, keyValue: string, functionInfo?: FunctionInfo, handleUnauthorized?: boolean): Observable<Response | FunctionKey> {
        handleUnauthorized = typeof handleUnauthorized !== 'undefined' ? handleUnauthorized : true;

        const url = functionInfo
            ? `${this.mainSiteUrl}/admin/functions/${functionInfo.name}/keys/${keyName}`
            : `${this.mainSiteUrl}/admin/host/keys/${keyName}`;

        let result: Observable<FunctionKey>;
        if (keyValue) {
            const body = {
                name: keyName,
                value: keyValue
            };
            result = this._http.put(url, JSON.stringify(body), { headers: this.getMainSiteHeaders() })
                .retryWhen(this.retryAntares)
                .map(r => <FunctionKey>r.json());
        } else {
            result = this._http.post(url, '', { headers: this.getMainSiteHeaders() })
                .retryWhen(this.retryAntares)
                .map(r => <FunctionKey>r.json());
        }
        return result
            .catch((error: Response) => {
                if (handleUnauthorized && error.status === 401) {
                    this.trackEvent(ErrorIds.unauthorizedTalkingToRuntime, {
                        usedKey: this.sanitize(this.masterKey)
                    });
                    return this.getHostSecretsFromScm().mergeMap(() => this.createKey(keyName, keyValue, functionInfo, false));
                } else {
                    throw error;
                }
            })
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToCreateFunctionKey + functionInfo + keyName),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToCreateFunctionKey, { functionName: functionInfo.name, keyName: keyName }),
                        errorId: ErrorIds.unableToCreateFunctionKey + functionInfo + keyName,
                        errorType: ErrorType.RuntimeError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToCreateFunctionKey, {
                        status: error.status.toString(),
                        content: error.text(),
                        functionName: functionInfo.name,
                        keyName: keyName
                    });
                }
            });
    }

    deleteKey(key: FunctionKey, functionInfo?: FunctionInfo, handleUnauthorized?: boolean): Observable<Response> {
        handleUnauthorized = typeof handleUnauthorized !== 'undefined' ? handleUnauthorized : true;

        const url = functionInfo
            ? `${this.mainSiteUrl}/admin/functions/${functionInfo.name}/keys/${key.name}`
            : `${this.mainSiteUrl}/admin/host/keys/${key.name}`;

        return this._http.delete(url, { headers: this.getMainSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch((error: Response) => {
                if (handleUnauthorized && error.status === 401) {
                    this.trackEvent(ErrorIds.unauthorizedTalkingToRuntime, {
                        usedKey: this.sanitize(this.masterKey)
                    });
                    return this.getHostSecretsFromScm().mergeMap(() => this.deleteKey(key, functionInfo, false));
                } else {
                    throw error;
                }
            })
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToDeleteFunctionKey + functionInfo + key.name),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToDeleteFunctionKey, { functionName: functionInfo.name, keyName: key.name }),
                        errorId: ErrorIds.unableToDeleteFunctionKey + functionInfo + key.name,
                        errorType: ErrorType.RuntimeError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToDeleteFunctionKey, {
                        status: error.status.toString(),
                        content: error.text(),
                        functionName: functionInfo.name,
                        keyName: key.name
                    });
                }
            });
    }

    renewKey(key: FunctionKey, functionInfo?: FunctionInfo, handleUnauthorized?: boolean): Observable<Response> {
        handleUnauthorized = typeof handleUnauthorized !== 'undefined' ? handleUnauthorized : true;

        const url = functionInfo
            ? `${this.mainSiteUrl}/admin/functions/${functionInfo.name}/keys/${key.name}`
            : `${this.mainSiteUrl}/admin/host/keys/${key.name}`;
        return this._http.post(url, '', { headers: this.getMainSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch((error: Response) => {
                if (handleUnauthorized && error.status === 401) {
                    this.trackEvent(ErrorIds.unauthorizedTalkingToRuntime, {
                        usedKey: this.sanitize(this.masterKey)
                    });
                    return this.getHostSecretsFromScm().mergeMap(() => this.renewKey(key, functionInfo, false));
                } else {
                    throw error;
                }
            })
            .do(r => {
                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRenewFunctionKey + functionInfo + key.name);
                if (!functionInfo && key.name === '_master') {
                    this.masterKey = r.json().value;
                }
            },
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToRenewFunctionKey, { functionName: functionInfo.name, keyName: key.name }),
                        errorId: ErrorIds.unableToRenewFunctionKey + functionInfo + key.name,
                        errorType: ErrorType.RuntimeError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToRenewFunctionKey, {
                        status: error.status.toString(),
                        content: error.text(),
                        functionName: functionInfo.name,
                        keyName: key.name
                    });
                }
            });
    }

    fireSyncTrigger() {
        const url = `${this._scmUrl}/api/functions/synctriggers`;
        this._http.post(url, '', { headers: this.getScmSiteHeaders() })
            .subscribe(success => console.log(success), error => console.log(error));
    }

    @Cache()
    getJson(uri: string) {
        return this._http.get(uri, { headers: this.getMainSiteHeaders() })
            .map(r => r.json());
    }

    checkIfSourceControlEnabled(): Observable<boolean> {
        return this._cacheService.getArm(`${this.site.id}/config/web`)
            .map(r => {
                const config: ArmObj<SiteConfig> = r.json();
                return !config.properties['scmType'] || config.properties['scmType'] !== 'None';
            })
            .catch(() => Observable.of(false));
    }

    private _editModeSubject: Subject<FunctionAppEditMode>;
    getFunctionAppEditMode(): Observable<FunctionAppEditMode> {
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
        if (!this._editModeSubject) {
            this._editModeSubject = new Subject<FunctionAppEditMode>();
        }

        Observable.zip(
            this.checkIfSourceControlEnabled(),
            this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true),
            SlotsService.isSlot(this.site.id)
                ? Observable.of(true)
                : this._slotsService.getSlotsList(this.site.id).map(r => r.length > 0),
            (a, b, s) => ({ sourceControlEnabled: a, appSettingsResponse: b, hasSlots: s })
        )
            .map(result => {
                const appSettings: ArmObj<any> = result.appSettingsResponse.json();
                const sourceControlled = result.sourceControlEnabled;

                let editModeSettingString: string = appSettings.properties[Constants.functionAppEditModeSettingName] || '';
                editModeSettingString = editModeSettingString.toLocaleLowerCase();

                if (editModeSettingString === Constants.ReadWriteMode) {
                    return sourceControlled ? FunctionAppEditMode.ReadWriteSourceControlled : FunctionAppEditMode.ReadWrite;
                } else if (editModeSettingString === Constants.ReadOnlyMode) {
                    return sourceControlled ? FunctionAppEditMode.ReadOnlySourceControlled : FunctionAppEditMode.ReadOnly;
                } else if (sourceControlled) {
                    return FunctionAppEditMode.ReadOnlySourceControlled;
                } else {
                    return result.hasSlots ? FunctionAppEditMode.ReadOnlySlots : FunctionAppEditMode.ReadWrite;
                }
            })
            .catch(() => Observable.of(FunctionAppEditMode.ReadWrite))
            .subscribe(r => this._editModeSubject.next(r));

        return this._editModeSubject;
    }

    public getAuthSettings(): Observable<AuthSettings> {
        if (this.tryFunctionsScmCreds) {
            return Observable.of({
                easyAuthEnabled: false,
                AADConfigured: false,
                AADNotConfigured: false,
                clientCertEnabled: false
            });
        }

        return this._cacheService.postArm(`${this.site.id}/config/authsettings/list`)
            .map(r => {
                const auth: ArmObj<any> = r.json();
                return {
                    easyAuthEnabled: auth.properties['enabled'] && auth.properties['unauthenticatedClientAction'] !== 1,
                    AADConfigured: auth.properties['clientId'] ? true : false,
                    AADNotConfigured: auth.properties['clientId'] ? false : true,
                    clientCertEnabled: this.site.properties.clientCertEnabled
                };
            });
    }

    diagnose(functionContainer: FunctionContainer): Observable<DiagnosticsResult[]> {
        return this._http.post(Constants.serviceHost + `api/diagnose${functionContainer.id}`, '', { headers: this.getPortalHeaders() })
            .map(r => <DiagnosticsResult[]>r.json())
            .catch((error: Response) => {
                this.trackEvent(ErrorIds.errorCallingDiagnoseApi, {
                    error: error.text(),
                    status: error.status.toString(),
                    resourceId: functionContainer.id
                });
                return Observable.of([]);
            });
    }

    /**
     * This method just pings the root of the SCM site. It doesn't care about the response in anyway or use it.
     */
    pingScmSite() {
        return this._http.get(this._scmUrl, { headers: this.getScmSiteHeaders() })
            .map(_ => null)
            .catch(() => Observable.of(null));
    }

    private getExtensionVersion() {
        return this._cacheService.postArm(`${this.site.id}/config/appsettings/list`)
            .map(r => {
                const appSettingsArm: ArmObj<any> = r.json();
                return appSettingsArm.properties[Constants.runtimeVersionAppSettingName];
            });
    }

    // to talk to scm site
    private getScmSiteHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        const headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');
        if (!this._globalStateService.showTryView && this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }

        if (this.tryFunctionsScmCreds) {
            headers.append('Authorization', `Basic ${this.tryFunctionsScmCreds}`);
        }
        return headers;
    }

    private getMainSiteHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        const headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');
        headers.append('x-functions-key', this.masterKey);
        return headers;
    }

    // to talk to Functions Portal
    private getPortalHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        const headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this.token) {
            headers.append('client-token', this.token);
            headers.append('portal-token', this.token);
        }

        return headers;
    }

    // to talk to TryAppservice
    private getTryAppServiceHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        const headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this._globalStateService.TryAppServiceToken) {
            headers.append('Authorization', `Bearer ${this._globalStateService.TryAppServiceToken}`);
        } else {
            headers.append('ms-x-user-agent', 'Functions/');
        }
        return headers;
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

    private retryAntares(error: Observable<any>): Observable<any> {
        return error.scan((errorCount: number, err: FunctionsResponse) => {
            if (err.isHandled || err.status < 500 || errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }

    private retryCreateTrialResource(error: Observable<any>): Observable<any> {
        return error.scan((errorCount: number, err: Response) => {
            // 400 => you already have a resource, 403 => No login creds provided
            if (err.status === 400 || err.status === 403 || errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }

    private retryGetTrialResource(error: Observable<any>): Observable<any> {
        return error.scan((errorCount: number, err: Response) => {
            // 403 => No login creds provided
            if (err.status === 403 || errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }

    private runFunctionInternal(response: Observable<Response>, functionInfo: FunctionInfo) {
        return response
            .catch((e: Response) => {
                return this.getAuthSettings()
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

    /**
     * returns the file name from a VfsObject or an href
     * @param file either a VfsObject or a string representing the file's href.
     */
    private getFileName(file: VfsObject | string): string {
        if (typeof file === 'string') {
            // if `file` is a string, that means it's in the format:
            //     https://<scmUrl>/api/vfs/path/to/file.ext
            return file
                .split('/') // [ 'https:', '', '<scmUrl>', 'api', 'vfs', 'path', 'to', 'file.ext' ]
                .pop(); // 'file.ext'
        } else {
            return file.name;
        }
    }

    /**
     * This function is just a wrapper around AiService.trackEvent. It injects default params expected from this class.
     * Currently that's only scmUrl
     * @param params any additional parameters to get added to the default parameters that this class reports to AppInsights
     */
    private trackEvent(name: string, params: { [name: string]: string }) {
        const standardParams = {
            scmUrl: this._scmUrl
        };

        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                standardParams[key] = params[key];
            }
        }

        this._aiService.trackEvent(name, standardParams);
    }

    private sanitize(value: string): string {
        if (value) {
            return value.substring(0, Math.min(3, value.length));
        } else {
            return 'undefined';
        }
    }

    getGeneratedSwaggerData(key: string) {
        const url: string = this.getMainSiteUrl() + '/admin/host/swagger/default?code=' + key;
        return this._http.get(url).map(r => r.json())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToloadGeneratedAPIDefinition),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToloadGeneratedAPIDefinition),
                        errorId: ErrorIds.unableToloadGeneratedAPIDefinition,
                        errorType: ErrorType.RuntimeError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToloadGeneratedAPIDefinition, {
                        status: error.status.toString(),
                        content: error.text(),
                    });
                }
            });
    }

    getSwaggerDocument(key: string) {
        const url: string = this.getMainSiteUrl() + '/admin/host/swagger?code=' + key;
        return this._http.get(url).map(r => { return r.json(); });
    }

    addOrUpdateSwaggerDocument(swaggerUrl: string, content: string) {
        return this._http.post(swaggerUrl, content).map(r => { return r.json(); })
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToUpdateSwaggerData),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToUpdateSwaggerData),
                        errorId: ErrorIds.unableToUpdateSwaggerData,
                        errorType: ErrorType.RuntimeError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToUpdateSwaggerData, {
                        status: error.status.toString(),
                        content: error.text(),
                    });
                }
            });
    }

    deleteSwaggerDocument(swaggerUrl: string) {
        return this._http.delete(swaggerUrl)
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToDeleteSwaggerData),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToDeleteSwaggerData),
                        errorId: ErrorIds.unableToDeleteSwaggerData,
                        errorType: ErrorType.RuntimeError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToDeleteSwaggerData, {
                        status: error.status.toString(),
                        content: error.text(),
                    });
                }
            });
    }

    saveHostJson(jsonString: string): Observable<any> {
        const headers = this.getScmSiteHeaders();
        headers.append('If-Match', '*');
        return this._http.put(`${this._scmUrl}/api/functions/config`, jsonString, { headers: headers })
            .map(r => r.json())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToUpdateRuntimeConfig),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToUpdateRuntimeConfig),
                        errorId: ErrorIds.unableToUpdateRuntimeConfig,
                        errorType: ErrorType.ApiError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToUpdateRuntimeConfig, {
                        status: error.status.toString(),
                        content: error.text(),
                    });
                }
            });
    }

    createSystemKey(keyName: string) {
        const headers = this.getMainSiteHeaders();
        headers.append('If-Match', '*');
        return this._http.post(`${this.mainSiteUrl}/admin/host/systemkeys/${keyName}`, '', { headers: headers })
            .map(r => r.json())
            .do(_ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToCreateSwaggerKey),
            (error: FunctionsResponse) => {
                if (!error.isHandled) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_unableToCreateSwaggerKey),
                        errorId: ErrorIds.unableToCreateSwaggerKey,
                        errorType: ErrorType.RuntimeError,
                        resourceId: this.site.id
                    });
                    this.trackEvent(ErrorIds.unableToCreateSwaggerKey, {
                        status: error.status.toString(),
                        content: error.text(),
                    });
                }
            });
    }

    getSystemKey(): Observable<FunctionKeys> {
        const masterKey = this.masterKey
            ? Observable.of(null) // you have to pass something to Observable.of() otherwise it doesn't trigger subscribers.
            : this.getHostSecretsFromScm();

        return masterKey
            .mergeMap(_ => {
                const headers = this.getMainSiteHeaders();
                return this._http.get(`${this.mainSiteUrl}/admin/host/systemkeys`, { headers: headers })
                    .map(r => <FunctionKeys>r.json())
                    .do(__ => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToGetSystemKey),
                    (error: FunctionsResponse) => {
                        if (!error.isHandled) {
                            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                message: this._translateService.instant(PortalResources.error_unableToGetSystemKey, { keyName: Constants.swaggerSecretName }),
                                errorId: ErrorIds.unableToCreateSwaggerKey,
                                errorType: ErrorType.RuntimeError,
                                resourceId: this.site.id
                            });
                            this.trackEvent(ErrorIds.unableToGetSystemKey, {
                                status: error.status.toString(),
                                content: error.text(),
                            });
                        }
                    });
            });
    }

    getEventGridKey(): Observable<string> {
        return this.getSystemKey().map(keys => {
            const eventGridKey = keys.keys.find(k => k.name === Constants.eventGridName);
            return eventGridKey ? eventGridKey.value : '';
        });
    }

    // Modeled off of EventHub trigger's 'custom' tab when creating a new Event Hub connection
    createApplicationSetting(appSettingName: string, appSettingValue: string, replaceIfExists: boolean = true): Observable<any> | null {
        if (appSettingName && appSettingValue) {
            return this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true).flatMap(
                r => {
                    const appSettings: ArmObj<any> = r.json();
                    if (!replaceIfExists && appSettings.properties[appSettingName]) {
                        return Observable.of(r);
                    }
                    appSettings.properties[appSettingName] = appSettingValue;
                    return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);
                });
        } else {
            return null;
        }
    }

    // Set multiple auth settings at once
    createAuthSettings(newAuthSettings: Map<string, any>): Observable<any> {
        if (newAuthSettings.size > 0) {
            return this._cacheService.postArm(`${this.site.id}/config/authsettings/list`, true)
                .flatMap(r => {
                    var authSettings: ArmObj<any> = r.json();
                    newAuthSettings.forEach((value, key) => {
                        authSettings.properties[key] = value;
                    });
                    return this._cacheService.putArm(authSettings.id, this._armService.websiteApiVersion, authSettings);
                });
        } else {
            return Observable.of(null);
        }
    }
}
