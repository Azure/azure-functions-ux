import { DiagnosticsResult } from './../models/diagnostics-result';
import { WebApiException } from './../models/webapi-exception';
import { FunctionsResponse } from './../models/functions-response';
import {Http, Headers, Response, ResponseType} from '@angular/http';
import {Injectable} from '@angular/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {ScmInfo} from '../models/scm-info';
import {PassthroughInfo} from '../models/passthrough-info';
import {CreateFunctionInfo} from '../models/create-function-info';
import {FunctionTemplate} from '../models/function-template';
import {RunResponse} from '../models/run-response';
import {Observable} from 'rxjs/Rx';
import {DesignerSchema} from '../models/designer-schema';
import {FunctionSecrets} from '../models/function-secrets';
import {Subscription} from '../models/subscription';
import {ServerFarm} from '../models/server-farm';
import {BindingConfig} from '../models/binding';
import {PortalService} from './portal.service';
import {UserService} from './user.service';
import {FunctionContainer} from '../models/function-container';
import {RunFunctionResult} from '../models/run-function-result';
import {Constants} from '../models/constants';
import {Cache, ClearCache, ClearAllFunctionCache} from '../decorators/cache.decorator';
import {GlobalStateService} from './global-state.service';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {UIResource, AppService, ITryAppServiceTemplate} from '../models/ui-resource';
import {Cookie} from 'ng2-cookies/ng2-cookies';
import {UsageVolume} from '../models/app-monitoring-usage'
import {BroadcastService} from './broadcast.service';
import {ArmService} from './arm.service';
import {BroadcastEvent} from '../models/broadcast-event';
import { ErrorEvent, ErrorType } from '../models/error-event';
import {HttpRunModel} from '../models/http-run';
import {FunctionKeys, FunctionKey} from '../models/function-key';
import {StartupInfo} from '../models/portal';
import {CacheService} from './cache.service';
import {ArmObj} from '../models/arm/arm-obj';
import {Site} from '../models/arm/site';
import {FunctionApp} from '../function-app';
import {SiteDescriptor} from '../resourceDescriptors';
import { AiService } from './ai.service';
import { ErrorIds } from '../models/error-ids';

declare var mixpanel: any;

@Injectable()
export class FunctionsService {
    private masterKey: string;
    private token: string;
    private _scmUrl: string;
    private siteName: string;
    private mainSiteUrl: string;
    public isEasyAuthEnabled: boolean;
    public selectedFunction: string;
    public selectedLanguage: string;
    public selectedProvider: string;
    public selectedFunctionName: string;

    public isMultiKeySupported: boolean = true;

    private tryAppServiceUrl = 'https://tryappservice.azure.com';
    private functionContainer: FunctionContainer;

    constructor(
        private _http: Http,
        private _userService: UserService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        private _armService: ArmService,
        private _cacheService: CacheService,
        private _aiService: AiService) {

        if (!Constants.runtimeVersion) {
            this.getLatestRuntime().subscribe((runtime: any) => {
                Constants.runtimeVersion = runtime;
            });
        }

        if (!_globalStateService.showTryView) {
            this._userService.getStartupInfo().subscribe(info =>{ this.token = info.token});
        }

        if (Cookie.get('TryAppServiceToken')) {
            this._globalStateService.TryAppServiceToken = Cookie.get('TryAppServiceToken');
            let templateId = Cookie.get('templateId');
            this.selectedFunction = templateId.split('-')[0].trim();
            this.selectedLanguage = templateId.split('-')[1].trim();
            this.selectedProvider = Cookie.get('provider');
            this.selectedFunctionName = Cookie.get('functionName');
        }
    }

    // This function is special cased in the Cache() decorator by name to allow for dev scenarios.
    @Cache()
    getTemplates() {
         try {
            if (localStorage.getItem('dev-templates')) {
                let devTemplate: FunctionTemplate[] = JSON.parse(localStorage.getItem('dev-templates'));
                // this.localize(devTemplate);
                return Observable.of(devTemplate);
            }
        } catch (e) {
            console.error(e);
        }

        let url = `${Constants.serviceHost}api/templates?runtime='latest'`;
        return this._http.get(url, { headers: this.getPortalHeaders() })
            .retryWhen(this.retryAntares)
            .map(r => {
                let object = r.json();
                // this.localize(object);
                return <FunctionTemplate[]>object;
            });
    }

    @Cache()
    getDesignerSchema() {
        return this._http.get('mocks/function-json-schema.json')
            .retryWhen(this.retryAntares)
            .map(r => <DesignerSchema>r.json());
    }

    getTrialResource(provider?: string): Observable<UIResource> {
        let url = this.tryAppServiceUrl + '/api/resource?appServiceName=Function'
            + (provider ? '&provider=' + provider : '');

        return this._http.get(url, { headers: this.getTryAppServiceHeaders() })
            .retryWhen(this.retryGetTrialResource)
            .map(r => <UIResource>r.json());
    }

    createTrialResource(selectedTemplate: FunctionTemplate, provider: string, functionName: string): Observable<UIResource> {
        let url = this.tryAppServiceUrl + '/api/resource?appServiceName=Function'
            + (provider ? '&provider=' + provider : '')
            + '&templateId=' + encodeURIComponent(selectedTemplate.id)
            + '&functionName=' + encodeURIComponent(functionName);

        let template = <ITryAppServiceTemplate>{
            name: selectedTemplate.id,
            appService: 'Function',
            language: selectedTemplate.metadata.language,
            githubRepo: ''
        };

        return this._http.post(url, JSON.stringify(template), { headers: this.getTryAppServiceHeaders() })
            .retryWhen(this.retryCreateTrialResource)
            .map(r => <UIResource>r.json());
    }

    getFunctionAppArmId() {
        if (this.functionContainer && this.functionContainer.id && this.functionContainer.id.trim().length !== 0) {
            return this.functionContainer.id;
        } else if (this._scmUrl) {
            return this._scmUrl;
        } else {
            return 'Unknown';
        }
    }

    getLatestRuntime() {
        return this._http.get(Constants.serviceHost + 'api/latestruntime', { headers: this.getPortalHeaders() })
            .map(r => {
                return r.json();
            })
            .retryWhen(this.retryAntares);
    }

    // to talk to scm site
    private getScmSiteHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        let headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');
        if (!this._globalStateService.showTryView && this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }
        // if (this._globalStateService.TryAppServiceScmCreds) {
        //     headers.append('Authorization', `Basic ${this._globalStateService.TryAppServiceScmCreds}`);
        // }
        return headers;
    }

    private getMainSiteHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        let headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');
        headers.append('x-functions-key', this.masterKey);
        return headers;
    }

    // to talk to Functions Portal
    private getPortalHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        let headers = new Headers();
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
        let headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this._globalStateService.TryAppServiceToken) {
            headers.append('Authorization', `Bearer ${this._globalStateService.TryAppServiceToken}`);
        } else {
            headers.append('ms-x-user-agent', 'Functions/');
        }
        return headers;
    }

    private getLocalizedResources(lang: string, runtime: string): Observable<any> {
        return this._http.get(Constants.serviceHost + `api/resources?name=${lang}&runtime=${runtime}`, { headers: this.getPortalHeaders() })
            .retryWhen(this.retryAntares)
            .map(r => {
                let resources = r.json();

                this._translateService.setDefaultLang('en');
                this._translateService.setTranslation('en', resources.en);
                if (resources.lang) {
                    this._translateService.setTranslation(lang, resources.lang);
                }
                this._translateService.use(lang);
            });
    }

    private retryAntares(error: Observable<any>): Observable<any> {
        return error.scan<number>((errorCount, err: FunctionsResponse) => {
            if (err.isHandled || err.status < 500 || errorCount >= 10) {
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

    /**
     * This function is just a wrapper around AiService.trackEvent. It injects default params expected from this class.
     * Currently that's only scmUrl
     * @param params any additional parameters to get added to the default parameters that this class reports to AppInsights
     */
    private trackEvent(name: string, params: {[name: string]: string}) {
        let standardParams = {
            scmUrl: this._scmUrl
        };

        for (let key in params) {
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
}
