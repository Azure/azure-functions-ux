import { LanguageService } from './services/language.service';
import { SiteConfig } from './models/arm/site-config';
import {Http, Headers, Response, ResponseType} from '@angular/http';
import {Injectable} from '@angular/core';
import {FunctionInfo} from './models/function-info';
import {VfsObject} from './models/vfs-object';
import {ScmInfo} from './models/scm-info';
import {PassthroughInfo} from './models/passthrough-info';
import {CreateFunctionInfo} from './models/create-function-info';
import {FunctionTemplate} from './models/function-template';
import {RunResponse} from './models/run-response';
import {Observable} from 'rxjs/Rx';
import {DesignerSchema} from './models/designer-schema';
import {FunctionSecrets} from './models/function-secrets';
import {Subscription} from './models/subscription';
import {ServerFarm} from './models/server-farm';
import {BindingConfig} from './models/binding';
import {PortalService} from './services/portal.service';
import {UserService} from './services/user.service';
import {FunctionContainer} from './models/function-container';
import {RunFunctionResult} from './models/run-function-result';
import {Constants} from './models/constants';
import {Cache, ClearCache, ClearAllFunctionCache} from './decorators/cache.decorator';
import {GlobalStateService} from './services/global-state.service';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {PortalResources} from './models/portal-resources';
import {UIResource, AppService, ITryAppServiceTemplate} from './models/ui-resource';
import {Cookie} from 'ng2-cookies/ng2-cookies';
import {UsageVolume} from './models/app-monitoring-usage'
import {BroadcastService} from './services/broadcast.service';
import {ArmService} from './services/arm.service';
import {BroadcastEvent} from './models/broadcast-event';
import {ErrorEvent} from './models/error-event';
import {HttpRunModel} from './models/http-run';
import {FunctionKeys, FunctionKey} from './models/function-key';
import {StartupInfo} from './models/portal';
import {CacheService} from './services/cache.service';
import {ArmObj} from './models/arm/arm-obj';
import {Site} from './models/arm/site';

declare var mixpanel: any;

export class FunctionApp {
    private masterKey: string;
    private token: string;
    private scmUrl: string;
    private storageConnectionString: string;
    private siteName: string;
    private mainSiteUrl: string;
    public selectedFunction: string;
    public selectedLanguage: string;
    public selectedProvider: string;
    public selectedFunctionName: string;

    private azureScmServer: string;
    private azureMainServer: string;
    private localServer: string;

    private localAdminKey: string = '';
    private azureAdminKey: string;
    public isMultiKeySupported: boolean = false;
    public isAlwaysOn : boolean = false;
    
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
    private statusCodeMap = {
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
    }

    private tryAppServiceUrl = "https://tryappservice.azure.com";
    // private functionContainer: FunctionContainer;

    constructor(
        public site : ArmObj<Site>,
        private _http: Http,
        private _userService: UserService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        private _armService: ArmService,
        private _cacheService: CacheService,
        private _languageService : LanguageService) {

        if (!Constants.runtimeVersion) {
            this.getLatestRuntime().subscribe((runtime: any) => {
                Constants.runtimeVersion = runtime;
            });
        }

        if (!_globalStateService.showTryView) {
            this._userService.getStartupInfo()
            .flatMap(info =>{
                this.token = info.token;
                return this.getExtensionVersion();
            })
            .flatMap(extensionVersion => {
                return this._languageService.getResources(extensionVersion);
            })
            .subscribe(r =>{
            })

            this.scmUrl = `https://${this.site.properties.hostNameSslStates.find(s => s.hostType === 1).name}/api`;
            this.mainSiteUrl = `https://${this.site.properties.defaultHostName}`;
            this.siteName = this.site.name;
            this.azureMainServer = this.mainSiteUrl;
            this.azureScmServer = `https://${this.site.properties.hostNameSslStates.find(s => s.hostType === 1).name}`;
            this.localServer = 'https://localhost:6061';
        }
        if (Cookie.get('TryAppServiceToken')) {
            this._globalStateService.TryAppServiceToken = Cookie.get('TryAppServiceToken');
            var templateId = Cookie.get('templateId');
            this.selectedFunction = templateId.split('-')[0].trim();
            this.selectedLanguage = templateId.split('-')[1].trim();
            this.selectedProvider = Cookie.get('provider');
            this.selectedFunctionName = Cookie.get('functionName');
        }
    }

    getParameterByName(url, name) {
        if (url === null)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    setScmParams(fc: FunctionContainer) {
        this.scmUrl = `https://${fc.properties.hostNameSslStates.find(s => s.hostType === 1).name}/api`;
        this.mainSiteUrl = `https://${fc.properties.defaultHostName}`;
        this.siteName = fc.name;
        if (fc.tryScmCred != null) {
            this._globalStateService.ScmCreds = fc.tryScmCred;
            this.azureScmServer = `https://${fc.properties.hostNameSslStates.find(s => s.hostType === 1).name}`;
        }
    }

    getFunctions() {
        return this._cacheService.get(`${this.scmUrl}/functions`, false, this.getScmSiteHeaders())
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<FunctionInfo[]>((r) => {
                try {
                    return r.json();
                } catch (e) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }) })
                    return [];
                }
            });
    }

    @Cache('href')
    getFileContent(file: VfsObject | string) {
        return this._http.get(typeof file === 'string' ? file : file.href, { headers: this.getScmSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<string>(r => r.text());
    }

    @ClearCache('getFileContent', 'href')
    saveFile(file: VfsObject | string, updatedContent: string, functionInfo?: FunctionInfo) {
        var headers = this.getScmSiteHeaders('plain/text');
        headers.append('If-Match', '*');

        if (functionInfo) {
            ClearAllFunctionCache(functionInfo);
        }

        return this._http.put(typeof file === 'string' ? file : file.href, updatedContent, { headers: headers })
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<VfsObject | string>(r => file);
    }

    @ClearCache('getFileContent', 'href')
    deleteFile(file: VfsObject | string, functionInfo?: FunctionInfo) {
        var headers = this.getScmSiteHeaders('plain/text');
        headers.append('If-Match', '*');

        if (functionInfo) {
            ClearAllFunctionCache(functionInfo);
        }

        return this._http.delete(typeof file === 'string' ? file : file.href, { headers: headers })
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<VfsObject | string>(r => file);
    }

    ClearAllFunctionCache(functionInfo: FunctionInfo) {
        ClearAllFunctionCache(functionInfo);
    }

    getTemplates() {
         try {
            if (localStorage.getItem('dev-templates')) {
                let devTemplate: FunctionTemplate[] = JSON.parse(localStorage.getItem('dev-templates'));
                this.localize(devTemplate);
                return Observable.of(devTemplate);
            }
         } catch (e) {
             console.error(e);
         }

         return this.getExtensionVersion()
         .flatMap(extensionVersion =>{
             return this._cacheService.get(
                 Constants.serviceHost + 'api/templates?runtime=' + (extensionVersion || 'latest'),
                 true,
                 this.getPortalHeaders())
         })
        .retryWhen(this.retryAntares)
        .map<FunctionTemplate[]>(r => {
            var object = r.json();
            this.localize(object);
            return object;
        });
    }

    @ClearCache('getFunctions')
    createFunction(functionName: string, templateId: string) {
        if (templateId) {
            var body: CreateFunctionInfo = {
                name: functionName,
                templateId: (templateId && templateId !== 'Empty' ? templateId : null),
                containerScmUrl: this.scmUrl
            };
            return this._http.put(`${this.scmUrl}/functions/${functionName}`, JSON.stringify(body), { headers: this.getScmSiteHeaders() })
                .retryWhen(this.retryAntares)
                .catch(e => this.checkCorsOrDnsErrors(e))
                .map<FunctionInfo>(r => r.json());
        } else {
            return this._http.put(`${this.scmUrl}/functions/${functionName}`, JSON.stringify({ config: {} }), { headers: this.getScmSiteHeaders() })
                .retryWhen(this.retryAntares)
                .catch(e => this.checkCorsOrDnsErrors(e))
                .map<FunctionInfo>(r => r.json());
        }
    }

    getFunctionContainerAppSettings(functionContainer: FunctionContainer) {
        var url = `${this.scmUrl}/settings`;
        return this._http.get(url, { headers: this.getScmSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<{ [key: string]: string }>(r => r.json());
    }

    @ClearCache('getFunctions')
    createFunctionV2(functionName: string, files: any, config: any) {
        var filesCopy = Object.assign({}, files);
        var sampleData = filesCopy["sample.dat"];
        delete filesCopy["sample.dat"];

        return this._http.put(`${this.scmUrl}/functions/${functionName}`, JSON.stringify({ files: filesCopy, test_data: sampleData, config: config }), { headers: this.getScmSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<FunctionInfo>(r => r.json());
    }

    getNewFunctionNode(): FunctionInfo {
        return {
            name: this._translateService.instant(PortalResources.sideBar_newFunction),
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
            functionApp : null
        };
    }

    getSettingsNode(): FunctionInfo {
        return {
            name: "Settings",
            href: null,
            config: null,
            script_href: `${this.scmUrl}/functions/config`,
            template_id: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null,
            test_data: null,
            script_root_path_href: null,
            config_href: null,
            functionApp : null
        };
    }

    statusCodeToText(code: number) {
        var statusClass = Math.floor(code / 100) * 100;
        return this.statusCodeMap[code] || this.genericStatusCodeMap[statusClass] || 'Unknown Status Code';
    }

    runHttpFunction(functionInfo: FunctionInfo, url: string, model: HttpRunModel) {
        var content = model.body;

        var regExp = /\{([^}]+)\}/g;
        var matchesPathParams = url.match(regExp);
        var processedParams = [];

        var splitResults = url.split("?");
        if (splitResults.length === 2) {
            url = splitResults[0];
        }

        if (matchesPathParams) {
            matchesPathParams.forEach((m) => {
                var name = m.split(":")[0].replace("{", "").replace("}", "");
                processedParams.push(name);
                var param = model.queryStringParams.find((p) => {
                    return p.name === name;
                });
                if (param) {
                    url = url.replace(m, param.value);
                }
            });
        }

        var firstDone = false;
        model.queryStringParams.forEach((p, index) => {
            var findResult = processedParams.find((pr) => {
                return pr === p.name;
            });

            if (!findResult) {
                if (!firstDone) {
                    url += '?';
                    firstDone = true;
                } else {
                    url += '&';
                }
                url += p.name + "=" + p.value;
            }
        });
        var inputBinding = (functionInfo.config && functionInfo.config.bindings
            ? functionInfo.config.bindings.find(e => e.type === 'httpTrigger')
            : null);

        var contentType: string;
        if (!inputBinding || inputBinding && inputBinding.webHookType) {
            contentType = 'application/json';
        }

        var headers = this.getMainSiteHeaders(contentType);
        model.headers.forEach((h) => {
            headers.append(h.name, h.value);
        });

        var response: Observable<Response>;
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

        var url = `${this.mainSiteUrl}/admin/functions/${functionInfo.name.toLocaleLowerCase()}`;

        var _content: string = JSON.stringify({ input: content });

        var contentType: string;

        try {
            var temp = JSON.parse(_content);
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
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<string>(r => r.statusText);
    }

    @Cache()
    getDesignerSchema() {
        return this._http.get(Constants.serviceHost + 'mocks/function-json-schema.json')
            .retryWhen(this.retryAntares)
            .map<DesignerSchema>(r => r.json());
    }

    warmupMainSite() {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: this.scmUrl.replace('.scm.', '.')
        };
        var observable = this._cacheService.get(this.mainSiteUrl, false, this.getScmSiteHeaders())
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<string>(r => r.statusText);

        observable.subscribe(() => this.getHostSecrets(), () => this.getHostSecrets());
        return observable;
    }

    @Cache('secrets_file_href')
    getSecrets(fi: FunctionInfo) {
        return this._http.get(fi.secrets_file_href, { headers: this.getScmSiteHeaders() })
            .catch(_ => Observable.of({
                json: () => { return {}; }
            }))
            .map<FunctionSecrets>(r => r.json())
    }

    @ClearCache('getSecrets', 'secrets_file_href')
    setSecrets(fi: FunctionInfo, secrets: FunctionSecrets) {
        return this.saveFile(fi.secrets_file_href, JSON.stringify(secrets))
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<FunctionSecrets>(e => secrets);
    }

    @Cache()
    getHostJson() {
        return this._http.get(`${this.azureScmServer}/functions/config`, { headers: this.getScmSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch(_ => Observable.of({
                json: () => { return {}; }
            }))
            .map<any>(r => {
                return r.json();
            });
    }

    @ClearCache('getFunction', 'href')
    saveFunction(fi: FunctionInfo, config: any) {
        ClearAllFunctionCache(fi);
        return this._http.put(fi.href, JSON.stringify({ config: config }), { headers: this.getScmSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<FunctionInfo>(r => r.json());
    }

    // @Cache('href')
    // getFunction(fi: FunctionInfo) {
    //     return this._http.get(fi.href, { headers: this.getScmSiteHeaders() })
    //         .retryWhen(this.retryAntares)
    //         .map<FunctionInfo>(r => r.json());
    // }

    getScmUrl() {
        return this.azureScmServer;
    }

    getSiteName() {
        return this.siteName;
    }

    getMainSiteUrl(): string {
        return this.mainSiteUrl;
    }

    getHostSecrets() {
        if (this.scmUrl.indexOf("localhost:6061") != -1) {
            this.masterKey = this.localAdminKey;
            this.isMultiKeySupported = true;
        }

        // call kudu
        let masterKey = this._http.get(`${this.scmUrl}/functions/admin/masterkey`, { headers: this.getScmSiteHeaders()})
            .retryWhen(e => e.scan<number>((errorCount, err: Response) => {
                if (err.status === 404) throw err;
                if (errorCount >= 10) {
                    throw err;
                }
                return errorCount + 1;
            }, 0).delay(400))
            .catch((e: Response) => {
                if (e.status === 404) throw e;
                return this.checkCorsOrDnsErrors(e);
            });
        masterKey
            .subscribe(r => {
                let masterKey: {masterKey: string} = r.json();
                this.masterKey = masterKey.masterKey;
                this.getFunctionHostKeys();
            }, e => {
                this.isMultiKeySupported = false;
                this.legacyGetHostSecrets();
            });
        return masterKey;
    }

    legacyGetHostSecrets() {
        return this._http.get(`${this.scmUrl}/vfs/data/functions/secrets/host.json`, { headers: this.getScmSiteHeaders() })
            .retryWhen(e => e.scan<number>((errorCount, err) => {
                if (errorCount >= 100) {
                    throw err;
                }
                return errorCount + 1;
            }, 0).delay(400))
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<string>(r => r.json().masterKey)
            .subscribe(h => {
                this.masterKey = h;
                this.isMultiKeySupported = false;
            }, e => console.log(e));
    }

    getFunctionHostKeys(): Observable<FunctionKeys> {
        let hostKeys = this._http.get(`${this.mainSiteUrl}/admin/host/keys`, {headers: this.getMainSiteHeaders()})
            .retryWhen(e => e.scan<number>((errorCount, err: Response) => {
                if (err.status === 404) throw err;
                if (errorCount >= 10) {
                    throw err;
                }
                return errorCount + 1;
            }, 0).delay(400))
            .catch((e: Response) => {
                if (e.status === 404) throw e;
                return this.checkCorsOrDnsErrors(e);
            })
            .map<FunctionKeys>(r => {
                let keys: FunctionKeys = r.json();
                if (keys && Array.isArray(keys.keys)) {
                    keys.keys.unshift({
                        name: '_master',
                        value: this.masterKey
                    });
                }
                return keys;
            });

            hostKeys.subscribe(r => {
                this.isMultiKeySupported = true;
            }, e => {
                this.isMultiKeySupported = false;
            });
        return hostKeys;
    }

    getBindingConfig(): Observable<BindingConfig> {
        try {
            if (localStorage.getItem('dev-bindings')) {
                let devBindings: BindingConfig = JSON.parse(localStorage.getItem('dev-bindings'));
                this.localize(devBindings);
                return Observable.of(devBindings);
            }
        } catch (e) {
            console.error(e);
        }

        return this.getExtensionVersion()
        .flatMap(extensionVersion =>{
            return this._cacheService.get(Constants.serviceHost + 'api/bindingconfig?runtime=' + extensionVersion, false, this.getPortalHeaders());
        })
        .retryWhen(this.retryAntares)
        .catch(e => this.checkCorsOrDnsErrors(e))
        .map<BindingConfig>(r => {
            var object = r.json();
            this.localize(object);
            return object;
        });
    }

    get HostSecrets() {
        return this.masterKey;
    }

    getTrialResource(provider?: string): Observable<UIResource> {
        var url = this.tryAppServiceUrl + "/api/resource?appServiceName=Function"
            + (provider ? "&provider=" + provider : "");

        return this._http.get(url, { headers: this.getTryAppServiceHeaders() })
            .retryWhen(this.retryGetTrialResource)
            .map<UIResource>(r => r.json());
    }

    createTrialResource(selectedTemplate: FunctionTemplate, provider: string, functionName: string): Observable<UIResource> {
        var url = this.tryAppServiceUrl + "/api/resource?appServiceName=Function"
            + (provider ? "&provider=" + provider : "")
            + "&templateId=" + encodeURIComponent(selectedTemplate.id)
            + "&functionName=" + encodeURIComponent(functionName);

        var template = <ITryAppServiceTemplate>{
            name: selectedTemplate.id,
            appService: "Function",
            language: selectedTemplate.metadata.language,
            githubRepo: ""
        };

        return this._http.post(url, JSON.stringify(template), { headers: this.getTryAppServiceHeaders() })
            .retryWhen(this.retryCreateTrialResource)
            .map<UIResource>(r => r.json());
    }

    updateFunction(fi: FunctionInfo) {
        ClearAllFunctionCache(fi);

        let fiCopy = <FunctionInfo>{};
        for(let prop in fi){
            if(fi.hasOwnProperty(prop) && prop !== "functionApp"){
                fiCopy[prop] = fi[prop];
            }
        }

        return this._http.put(fi.href, JSON.stringify(fiCopy), { headers: this.getScmSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<FunctionInfo>(r => r.json());
    }

    getFunctionErrors(fi: FunctionInfo) {
        return this.checkIfEasyAuthEnabled()
        .flatMap((isEasyAuthEnabled : boolean) =>{
            if(isEasyAuthEnabled){
                return Observable.of(<any>[]);
            }
            else{
                return this._http.get(`${this.mainSiteUrl}/admin/functions/${fi.name}/status`, { headers: this.getMainSiteHeaders() })
                    .retryWhen(this.retryAntares)
                    .map<string[]>(r => r.json().errors || [])
                    .catch<string[]>(e => Observable.of(null));
            }
        })

    }

    getHostErrors() {
        return this.checkIfEasyAuthEnabled()
        .flatMap(isEasyAuthEnabled =>{
            if(isEasyAuthEnabled || !this.masterKey){
                return Observable.of(<any>[]);
            }
            else{
                return this._http.get(`${this.mainSiteUrl}/admin/host/status`, { headers: this.getMainSiteHeaders() })
                    .retryWhen(e => e.scan<number>((errorCount, err) => {
                        // retry 12 times with 5 seconds delay. This would retry for 1 minute before throwing.
                        if (errorCount >= 12) {
                            throw err;
                        }
                        return errorCount + 1;
                    }, 0).delay(5000))
                    .catch(e => this.checkCorsOrDnsErrors(e))
                    .map<string[]>(r => r.json().errors || []);                
            }
        })

    }

    @Cache()
    getFunctionAppId() {
        return this.checkIfEasyAuthEnabled()
        .flatMap(isEasyAuthEnabled =>{
            if (isEasyAuthEnabled || !this.masterKey) {
                return Observable.of(<any>[]);
            }
            else{
                return this._http.get(`${this.mainSiteUrl}/admin/host/status`, { headers: this.getMainSiteHeaders() })
                    .map<string>(r => r.json().id)
                    .catch(e => Observable.of(null));
            }
        })
     }

    getOldLogs(fi: FunctionInfo, range: number): Observable<string> {
        return this._http.get(`${this.scmUrl}/vfs/logfiles/application/functions/function/${fi.name}/`, { headers: this.getScmSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch(e => Observable.of({ json: () => [] }))
            .flatMap<string>(r => {
                var files: any[] = r.json();
                if (files.length > 0) {
                    var headers = this.getScmSiteHeaders();
                    headers.append('Range', `bytes=-${range}`);
                    files.map(e => { e.parsedTime = new Date(e.mtime); return e; }).sort((a, b) => a.parsedTime.getTime() - b.parsedTime.getTime())
                    return this._http.get(files.pop().href, { headers: headers })
                        .map<string>(r => {
                            var content = r.text();
                            let index = content.indexOf('\n');
                            return index !== -1
                                ? content.substring(index + 1)
                                : content;
                        });
                } else {
                    return Observable.of('');
                }
            });
    }

    @Cache('href')
    getVfsObjects(fi: FunctionInfo | string) {
        return this._http.get(typeof fi === 'string' ? fi : fi.script_root_path_href, { headers: this.getScmSiteHeaders() })
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<VfsObject[]>(e => e.json());
    }

    @ClearCache('clearAllCachedData')
    clearAllCachedData() { }

    checkLocalFunctionsServer() {
        return this._http.get(this.localServer)
            .map<boolean>(r => true)
            .catch(e => Observable.of(false));
    }

    switchToLocalServer() {
        this.mainSiteUrl = this.localServer;
        this.scmUrl = this.localServer + '/admin';
        this.azureAdminKey = this.masterKey;
        this.masterKey = this.localAdminKey;
    }

    switchToAzure() {
        this.mainSiteUrl = this.azureMainServer;
        this.scmUrl = `${this.azureScmServer}/api`;
        this.masterKey = this.azureAdminKey;
    }

    launchVsCode() {
        return this._http.post(`${this.localServer}/admin/run/vscode`, '');
    }

    getLatestRuntime() {
        return this._http.get('api/latestruntime', { headers: this.getPortalHeaders() })
            .map(r => {
                return r.json();
            })
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e));
    }

    @Cache('href')
    getFunctionKeys(functionInfo: FunctionInfo) {
        return this._http.get(`${this.mainSiteUrl}/admin/functions/${functionInfo.name}/keys`, {headers: this.getMainSiteHeaders()})
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .map<FunctionKeys>(r => r.json());
    }

    @ClearCache('clearAllFunction', 'getFunctionKeys')
    @ClearCache('clearAllFunction', 'getFunctionHostKeys')
    createKey(keyName: string, keyValue: string, functionInfo?: FunctionInfo) {
        let url = functionInfo
            ? `${this.mainSiteUrl}/admin/functions/${functionInfo.name}/keys/${keyName}`
            : `${this.mainSiteUrl}/admin/host/keys/${keyName}`;

        if (keyValue) {
            var body = {
                name: keyName,
                value: keyValue
            };
           return this._http.put(url, JSON.stringify(body), {headers: this.getMainSiteHeaders()})
                    .retryWhen(this.retryAntares)
                    .catch(e => this.checkCorsOrDnsErrors(e))
                    .map<FunctionKey>(r => r.json());
        } else {
            return this._http.post(url, '', {headers: this.getMainSiteHeaders()})
                    .retryWhen(this.retryAntares)
                    .catch(e => this.checkCorsOrDnsErrors(e))
                    .map<FunctionKey>(r => r.json());
        }
    }

    @ClearCache('clearAllFunction', 'getFunctionKeys')
    @ClearCache('clearAllFunction', 'getFunctionHostKeys')
    deleteKey(key: FunctionKey, functionInfo?: FunctionInfo) {
        let url = functionInfo
            ? `${this.mainSiteUrl}/admin/functions/${functionInfo.name}/keys/${key.name}`
            : `${this.mainSiteUrl}/admin/host/keys/${key.name}`;

        return this._http.delete(url, {headers: this.getMainSiteHeaders()})
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e));
    }

    @ClearCache('clearAllFunction', 'getFunctionKeys')
    @ClearCache('clearAllFunction', 'getFunctionHostKeys')
    renewKey(key: FunctionKey, functionInfo?: FunctionInfo) {
        let url = functionInfo
            ? `${this.mainSiteUrl}/admin/functions/${functionInfo.name}/keys/${key.name}`
            : `${this.mainSiteUrl}/admin/host/keys/${key.name}`;
        let keyRenew = this._http.post(url, '', {headers: this.getMainSiteHeaders()})
            .retryWhen(this.retryAntares)
            .catch(e => this.checkCorsOrDnsErrors(e))
            .share();
        if (!functionInfo && key.name === '_master') {
            keyRenew.subscribe(r => {
                this.masterKey = r.json().value;
            });
            return keyRenew.delay(100);
        } else {
            return keyRenew;
        }
    }

    fireSyncTrigger() {
        let url = `${this.scmUrl}/functions/synctriggers`;
        this._http.post(url, '', { headers: this.getScmSiteHeaders() })
            .subscribe(success => console.log(success), error => console.log(error));
    }

    @Cache()
    getJson(uri: string) {
        return this._http.get(uri, { headers: this.getMainSiteHeaders() })
            .map<FunctionKeys>(r => r.json());
    }

    checkIfDisabled() {
        return this._cacheService.getArm(`${this.site.id}/config/web`)
        .map(r => {
            let config : ArmObj<SiteConfig> = r.json();
            if (!config.properties["scmType"] || config.properties["scmType"] !== "None") {
                return true;
            } else {
                return false;
            }
        });
    }

    private checkIfEasyAuthEnabled(){
        return this._cacheService.postArm(`${this.site.id}/config/authsettings/list`)
        .map(r =>{
            let auth : ArmObj<any> = r.json();
            return auth.properties['enabled'] && auth.properties['unauthenticatedClientAction'] !== 1;
        });
    }

    private getExtensionVersion(){
        return this._cacheService.postArm(`${this.site.id}/config/appsettings/list`)
        .map(r =>{
            let appSettingsArm : ArmObj<any> = r.json();
            return appSettingsArm.properties[Constants.runtimeVersionAppSettingName];
        });
    }

    //to talk to scm site
    private getScmSiteHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');
        if (!this._globalStateService.showTryView && this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }
        if (this._globalStateService.ScmCreds) {
            headers.append('Authorization', `Basic ${this._globalStateService.ScmCreds}`);
        }
        return headers;
    }

    private getMainSiteHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');
        headers.append('x-functions-key', this.masterKey);
        return headers;
    }

    //to talk to Functions Portal
    private getPortalHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this.token) {
            headers.append('client-token', this.token);
            headers.append('portal-token', this.token);
        }

        return headers;
    }

    //to talk to TryAppservice
    private getTryAppServiceHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this._globalStateService.TryAppServiceToken) {
            headers.append('Authorization', `Bearer ${this._globalStateService.TryAppServiceToken}`);
        } else {
            headers.append('ms-x-user-agent', 'Functions/');
        }
        return headers;
    }

    private localize(objectTolocalize: any) {
        if ((typeof value === "string") && (value.startsWith("$"))) {
            objectTolocalize[property] = this._translateService.instant(value.substring(1, value.length));
        }

        for (var property in objectTolocalize) {

            if (property === "files" || property === "defaultValue") {
                continue;
            }

            if (objectTolocalize.hasOwnProperty(property)) {
                var value = objectTolocalize[property];
                if ((typeof value === "string") && (value.startsWith("$"))) {
                    var key = value.substring(1, value.length);
                    var locString = this._translateService.instant(key);
                    if (locString !== key) {
                        objectTolocalize[property] = locString;
                    }
                }
                if (typeof value === "array") {
                    for (var i = 0; i < value.length; i++) {
                        this.localize(value[i]);
                    }
                }
                if (typeof value === "object") {
                    this.localize(value);
                }
            }
        }
    }

    private retryAntares(error: Observable<any>): Observable<any> {
        return error.scan<number>((errorCount, err: Response) => {
                if (errorCount >= 10) {
                    throw err;
                } else {
                    return errorCount + 1;
                }
            }, 0).delay(1000);
    }

    private retryCreateTrialResource(error: Observable<any>): Observable<any> {
        return error.scan<number>((errorCount, err: Response) => {
            // 400 => you already have a resource, 403 => No login creds provided
            if (err.status === 400 || err.status === 403 || errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }

    private retryGetTrialResource(error: Observable<any>): Observable<any> {
        return error.scan<number>((errorCount, err: Response) => {
            // 403 => No login creds provided
            if (err.status === 403 || errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }

    private checkCorsOrDnsErrors(error: Response): Observable<Response> {
        if (error.status < 404 && error.type === ResponseType.Error) {
            this._armService.getConfig(this.site.id)
                .subscribe(config => {
                    let cors: {allowedOrigins: string[]} = <any>config['cors'];
                    let isConfigured = (cors && cors.allowedOrigins && cors.allowedOrigins.length > 0)
                        ? !!cors.allowedOrigins.find(o => o.toLocaleLowerCase() === window.location.origin)
                        : false;
                    if (!isConfigured) {
                        // CORS Error
                        this._broadcastService.broadcast<ErrorEvent>(
                            BroadcastEvent.Error,
                            { message: this._translateService.instant(PortalResources.error_CORSNotConfigured, {origin: window.location.origin}), details: JSON.stringify(error) }
                        );
                    } else {
                        // DNS resolution or any error that results from the worker process crashing or restarting
                        this._broadcastService.broadcast<ErrorEvent>(
                            BroadcastEvent.Error,
                            { message: this._translateService.instant(PortalResources.error_DnsResolution) }
                        );
                    }
                }, (error: Response) => {
                        this._broadcastService.broadcast<ErrorEvent>(
                            BroadcastEvent.Error,
                            { message: this._translateService.instant(PortalResources.error_UnableToRetriveFunctionApp, {functionApp: this.site.name}), details: JSON.stringify(error) }
                        );
                });
        } else {
            this._broadcastService.broadcast<ErrorEvent>(
                BroadcastEvent.Error,
                { message: this._translateService.instant(PortalResources.error_UnableToRetriveFunctions, {statusText: this.statusCodeToText(error.status)}), details: JSON.stringify(error)}
             );
        }
        throw error;
    }

    private runFunctionInternal(response: Observable<Response>, functionInfo: FunctionInfo) {
         return response
            .catch((e: Response) => {

                return this.checkIfEasyAuthEnabled()
                .flatMap(isEasyAuthEnabled =>{

                    if (isEasyAuthEnabled) {
                        return Observable.of({
                            status: 401,
                            statusText: this.statusCodeToText(401),
                            text: () => this._translateService.instant(PortalResources.functionService_authIsEnabled)
                        });
                    } else if (e.status === 200 && e.type === ResponseType.Error) {
                        return Observable.of({
                            status: 502,
                            statusText: this.statusCodeToText(502),
                            text: () => this._translateService.instant(PortalResources.functionService_errorRunningFunc, { name: functionInfo.name })
                        });
                    } else {
                        return Observable.of({
                            status: e.status,
                            statusText: this.statusCodeToText(e.status),
                            text: () => e.text()
                        });
                    }
                });
            })
            .map<RunFunctionResult>(r => ({ statusCode: r.status, statusText: this.statusCodeToText(r.status), content: r.text() }));
    }
}