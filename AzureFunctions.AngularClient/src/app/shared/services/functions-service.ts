import { TryFunctionsService } from './try-functions.service';
import { ApiProxy } from './../models/api-proxy';
import { WebApiException, FunctionRuntimeError } from './../models/webapi-exception';
import { AuthSettings } from './../models/auth-settings';
import { HostingEnvironment } from './../models/arm/hosting-environment';
import { SiteService } from './slots.service';
import { FunctionAppEditMode } from 'app/shared/models/function-app-edit-mode';
import { SiteConfig } from './../models/arm/site-config';
import { PortalResources } from './../models/portal-resources';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TranslateService } from '@ngx-translate/core';
import { AiService } from 'app/shared/services/ai.service';
import { NoCorsHttpService } from './../no-cors-http-service';
import { BroadcastService } from './broadcast.service';
import { GlobalStateService } from './global-state.service';
import { FunctionAppContext } from './functions-service';
import { Observable } from 'rxjs/Observable';
import { UserService } from './user.service';
import { FunctionsResponse } from './../models/functions-response';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { ConfigService } from './config.service';
import { Site } from './../models/arm/site';
import { ArmObj } from './../models/arm/arm-obj';
import { FunctionInfo } from './../models/function-info';
import { CacheService } from 'app/shared/services/cache.service';
import { Injectable } from '@angular/core';
import { UrlTemplates } from 'app/shared/url-templates';
import { Http, Headers, Response } from '@angular/http';
import { ErrorIds } from '../models/error-ids';
import { ErrorEvent, ErrorType } from '../models/error-event';
import { Constants } from 'app/shared/models/constants';
import * as jsonschema from 'jsonschema';
import { FunctionsVersionInfoHelper} from '../models/functions-version-info';
import { HostStatus } from './../models/host-status';

export interface FunctionAppContext {
    site: ArmObj<Site>;
    scmUrl: string;
    mainSiteUrl: string;
    urlTemplates: UrlTemplates;
    tryFunctionsScmCreds?: string;
    masterKey?: string;
}

@Injectable()
export class FunctionsService {
    private _token: string;

    private _http: NoCorsHttpService;

    constructor(
        private _cacheService: CacheService,
        private _configService: ConfigService,
        private _userService: UserService,
        private _globalStateService: GlobalStateService,
        private _broadcastService: BroadcastService,
        private _ngHttp: Http,
        private _aiService: AiService,
        private _translateService: TranslateService,
        private _siteService: SiteService,
        private _tryFunctionsService: TryFunctionsService) {

        this._http = new NoCorsHttpService(this._cacheService, this._ngHttp, this._broadcastService, this._aiService, this._translateService, () => this._getPortalHeaders());

        this._userService.getStartupInfo()
            .subscribe(info => {
                this._token = info.token;
            });
    }

    getAppContext(siteResourceId: string): Observable<FunctionAppContext> {
        let context: FunctionAppContext;

        return this._cacheService.getArm(siteResourceId)
            .switchMap(r => {
                const site: ArmObj<Site> = r.json();
                const scmUrl = this.getScmUrl(site);
                const mainSiteUrl = this.getMainUrl(site);

                context = {
                    site: site,
                    scmUrl: scmUrl,
                    mainSiteUrl: mainSiteUrl,
                    urlTemplates: new UrlTemplates(scmUrl, mainSiteUrl, ArmUtil.isLinuxApp(site))
                };

                return this._initKeysAndWarmupMainSite(context);
            })
            .map(r => context);
    }

    getFunction(context: FunctionAppContext, functionName: string) {
        return this.getFunctions(context)
            .map(fcs => {
                return fcs && fcs.find(f => f.name.toLowerCase() === functionName.toLowerCase());
            });
    }

    getFunctions(context: FunctionAppContext) {
        let fcs: FunctionInfo[];

        return Observable.zip(
            this._cacheService.get(context.urlTemplates.functionsUrl, false, this._getScmSiteHeaders(context))
            .catch(() => this._http.get(context.urlTemplates.functionsUrl, { headers: this._getScmSiteHeaders(context) }))
            .retryWhen(this.retryAntares)
            .map((r: Response) => {
                try {
                    fcs = r.json() as FunctionInfo[];
                    fcs.forEach(fc => fc.context = context);
                    return fcs;
                } catch (e) {
                    // We have seen this happen when kudu was returning JSON that contained
                    // comments because Json.NET is okay with comments in the JSON file.
                    // We can't parse that JSON in browser, so this is just to handle the error correctly.
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.error_parsingFunctionListReturenedFromKudu),
                        errorId: ErrorIds.deserializingKudusFunctionList,
                        errorType: ErrorType.Fatal,
                        resourceId: context.site.id
                    });
                    this._trackEvent(context, ErrorIds.deserializingKudusFunctionList, {
                        error: e,
                        content: r.text(),
                    });
                    return <FunctionInfo[]>[];
                }
            }),
            this._cacheService.postArm(`${context.site.id}/config/appsettings/list`),
            (functions, appSettings) => ({functions: functions, appSettings: appSettings.json()}))
            .map(result => {
                // For runtime 2.0 we use settings for disabling functionsgit branch
                const appSettings = result.appSettings as ArmObj<any>;
                if (FunctionsVersionInfoHelper.getFuntionGeneration(appSettings.properties[Constants.runtimeVersionAppSettingName]) === 'V2') {
                    result.functions.forEach(f => {
                        const disabledSetting = appSettings.properties[`AzureWebJobs.${f.name}.Disabled`];
                        f.config.disabled = (disabledSetting && disabledSetting.toLocaleLowerCase() === 'true');
                    });
                }
                return result.functions;
            })
            .do(() => this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.unableToRetrieveFunctionsList),
                (error: FunctionsResponse) => {
                    if (!error.isHandled) {
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: this._translateService.instant(PortalResources.error_unableToRetrieveFunctionListFromKudu),
                            errorId: ErrorIds.unableToRetrieveFunctionsList,
                            errorType: ErrorType.RuntimeError,
                            resourceId: context.site.id
                        });
                        this._trackEvent(context, ErrorIds.unableToRetrieveFunctionsList, {
                            content: error.text(),
                            status: error.status.toString()
                        });
                    }
                });
    }

    getApiProxies(context: FunctionAppContext) {
        return Observable.zip(
            this._cacheService.get(context.urlTemplates.proxiesJsonUrl, false, this._getScmSiteHeaders(context))
                .catch(() => this._http.get(context.urlTemplates.proxiesJsonUrl, { headers: this._getScmSiteHeaders(context) }))
                .retryWhen(e => e.scan((errorCount: number, err: Response) => {
                    if (err.status === 404 || errorCount >= 10) {
                        throw err;
                    }
                    return errorCount + 1;
                }, 0).delay(200))
                .catch(_ => Observable.of({
                    json: () => { return {}; }
                })),
            this._cacheService.get('assets/schemas/proxies.json', false, this._getPortalHeaders()),
            (p, s) => ({ proxies: p, schema: s.json() })
        ).map(r => {
            let proxies = null;
            try {
                proxies = r.proxies.json();
            } catch (e) {
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: `${this._translateService.instant(PortalResources.error_schemaValidationProxies)}. ${e}`,
                    errorId: ErrorIds.proxySchemaValidationFails,
                    errorType: ErrorType.Fatal,
                    resourceId: context.site.id
                });
                return ApiProxy.fromJson({});
            }

            if (proxies.proxies) {
                const validateResult = jsonschema.validate(proxies, r.schema).toString();

                if (validateResult) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: `${this._translateService.instant(PortalResources.error_schemaValidationProxies)}. ${validateResult}`,
                        errorId: ErrorIds.proxySchemaValidationFails,
                        errorType: ErrorType.Fatal,
                        resourceId: context.site.id
                    });
                    return ApiProxy.fromJson({});
                }
            }
            return ApiProxy.fromJson(proxies);
        });
    }

    getScmUrl(site: ArmObj<Site>) {
        if (this._configService.isStandalone()) {
            return this.getMainUrl(site);
        } else {
            return `https://${site.properties.hostNameSslStates.find(s => s.hostType === 1).name}`;
        }
    }

    getMainUrl(site: ArmObj<Site>) {
        if (this._configService.isStandalone()) {
            return `https://${site.properties.defaultHostName}/functions/${site.name}`;
        } else {
            return `https://${site.properties.defaultHostName}`;
        }
    }

    getFunctionHostStatus(context: FunctionAppContext, handleUnauthorized?: boolean): Observable<HostStatus> {
        handleUnauthorized = typeof handleUnauthorized !== 'undefined' ? handleUnauthorized : true;
        return this.getAuthSettings(context)
            .mergeMap(authSettings => {
                if (authSettings.clientCertEnabled || !context.masterKey) {
                    return Observable.of(null);
                } else {
                    return this._http.get(context.urlTemplates.runtimeStatusUrl, { headers: this.getMainSiteHeaders(context) })
                        .map(r => (r.json()))
                        .catch((error: Response) => {
                            if (handleUnauthorized && error.status === 401) {
                                this._trackEvent(context, ErrorIds.unauthorizedTalkingToRuntime, {
                                    usedKey: this.sanitize(context.masterKey)
                                });
                                return this._getHostSecretsFromScm(context).mergeMap(() => this.getFunctionHostStatus(context, false));
                            } else {
                                throw error;
                            }
                        })
                        .catch(() => Observable.of(null));
                }
            });
    }

    getFunctionAppEditMode(context: FunctionAppContext): Observable<FunctionAppEditMode> {
        // 4 settings to check here, SourceControl, Visual Studio generated, Slots, FUNCTION_APP_EDIT_MODE
        // editMode (true -> readWrite, false -> readOnly)
        // Table
        // | SourceControl | VS    | Slots | AppSettingValue | EditMode                  |
        // |---------------|-------|-------|-----------------|---------------------------|
        // | true          | true  | Yes   | readWrite       | ReadWriteSourceControlled |
        // | true          | true  | Yes   | readOnly        | ReadOnlySourceControlled  |
        // | true          | true  | Yes   | undefined       | ReadOnlySourceControlled  |
        // | true          | true  | No    | readWrite       | ReadWriteSourceControlled |
        // | true          | true  | No    | readOnly        | ReadOnlySourceControlled  |
        // | true          | true  | No    | undefined       | ReadOnlySourceControlled  |
        // | true          | false | Yes   | readWrite       | ReadWriteSourceControlled |
        // | true          | false | Yes   | readOnly        | ReadOnlySourceControlled  |
        // | true          | false | Yes   | undefined       | ReadOnlySourceControlled  |
        // | true          | false | No    | readWrite       | ReadWriteSourceControlled |
        // | true          | false | No    | readOnly        | ReadOnlySourceControlled  |
        // | true          | false | No    | undefined       | ReadOnlySourceControlled  |
        // | false         | true  | Yes   | readWrite       | ReadWriteVSGenerated      |
        // | false         | true  | Yes   | readOnly        | ReadOnlyVSGenerated       |
        // | false         | true  | Yes   | undefined       | ReadOnlyVSGenerated       |
        // | false         | true  | No    | readWrite       | ReadWriteVSGenerated      |
        // | false         | true  | No    | readOnly        | ReadOnlyVSGenerated       |
        // | false         | true  | No    | undefined       | ReadOnlyVSGenerated       |
        // | false         | false | Yes   | readWrite       | ReadWrite                 |
        // | false         | false | Yes   | readOnly        | ReadOnly                  |
        // | false         | false | Yes   | undefined       | ReadOnlySlots             |
        // | false         | false | No    | readWrite       | ReadWrite                 |
        // | false         | false | No    | readOnly        | ReadOnly                  |
        // | false         | false | No    | undefined       | ReadWrite                 |
        // |_______________|_______|_______|_________________|___________________________|

        return Observable.zip(
            this._checkIfSourceControlEnabled(context.site),
            this._cacheService.postArm(`${context.site.id}/config/appsettings/list`, true),
            SiteService.isSlot(context.site.id)
                ? Observable.of(true)
                : this._siteService.getSlotsList(context.site.id).map(r => r.length > 0),
            this.getFunctions(context),
            (a, b, s, f: FunctionInfo[]) => ({ sourceControlEnabled: a, appSettingsResponse: b, hasSlots: s, functions: f })
        )
            .map(result => {
                const appSettings: ArmObj<any> = result.appSettingsResponse.json();
                const sourceControlled = result.sourceControlEnabled;

                let editModeSettingString: string = appSettings.properties[Constants.functionAppEditModeSettingName] || '';
                editModeSettingString = editModeSettingString.toLocaleLowerCase();
                const vsCreatedFunc = result.functions.find((fc: any) => !!fc.config.generatedBy);
                const hasSlots = result.hasSlots;

                const resolveReadOnlyMode = () => {
                    if (sourceControlled) {
                        return FunctionAppEditMode.ReadOnlySourceControlled;
                    } else if (vsCreatedFunc) {
                        return FunctionAppEditMode.ReadOnlyVSGenerated;
                    } else if (hasSlots) {
                        return FunctionAppEditMode.ReadOnly;
                    } else {
                        return FunctionAppEditMode.ReadOnly;
                    };
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
                    };
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
                    };
                };

                if (editModeSettingString === Constants.ReadWriteMode) {
                    return resolveReadWriteMode();
                } else if (editModeSettingString === Constants.ReadOnlyMode) {
                    return resolveReadOnlyMode();
                } else {
                    return resolveUndefined();
                }
            })
            .catch(() => Observable.of(FunctionAppEditMode.ReadWrite));
    }

    reachableInternalLoadBalancerApp(context: FunctionAppContext, http: CacheService): Observable<boolean> {
        if (context && context.site &&
            context.site.properties.hostingEnvironmentProfile &&
            context.site.properties.hostingEnvironmentProfile.id) {
            return http.getArm(context.site.properties.hostingEnvironmentProfile.id, false, '2016-09-01')
                .mergeMap(r => {
                    const ase: ArmObj<HostingEnvironment> = r.json();
                    if (ase.properties.internalLoadBalancingMode &&
                        ase.properties.internalLoadBalancingMode !== 'None') {
                        return this.pingScmSite(context);
                    } else {
                        return Observable.of(true);
                    }
                });
        } else {
            return Observable.of(true);
        }
    }

    /**
     * This method just pings the root of the SCM site. It doesn't care about the response in anyway or use it.
     */
    pingScmSite(context: FunctionAppContext): Observable<boolean> {
        return this._http.get(context.urlTemplates.pingScmSiteUrl, { headers: this._getScmSiteHeaders(context) })
            .map(_ => true)
            .catch(() => Observable.of(false));
    }

    public getAuthSettings(context: FunctionAppContext): Observable<AuthSettings> {
        if (this._tryFunctionsService.functionContainer) {
            return Observable.of({
                easyAuthEnabled: false,
                AADConfigured: false,
                AADNotConfigured: false,
                clientCertEnabled: false
            });
        }

        return this._cacheService.postArm(`${context.site.id}/config/authsettings/list`)
            .map(r => {
                const auth: ArmObj<any> = r.json();
                return {
                    easyAuthEnabled: auth.properties['enabled'] && auth.properties['unauthenticatedClientAction'] !== 1,
                    AADConfigured: auth.properties['clientId'] ? true : false,
                    AADNotConfigured: auth.properties['clientId'] ? false : true,
                    clientCertEnabled: context.site.properties.clientCertEnabled
                };
            });
    }

    private _initKeysAndWarmupMainSite(context: FunctionAppContext) {
        this._http.post(context.urlTemplates.pingUrl, '')
            .retryWhen(this.retryAntares)
            .subscribe(() => { });

        return this._getHostSecretsFromScm(context);
    }

    private _getHostSecretsFromScm(context: FunctionAppContext) {
        return this.reachableInternalLoadBalancerApp(context, this._cacheService)
            .filter(i => i)
            .mergeMap(() => this.getAuthSettings(context))
            .mergeMap(authSettings => {
                return authSettings.clientCertEnabled
                    ? Observable.of()
                    : this._getHostToken(context)
                        .retryWhen(this.retryAntares)
                        .map(r => r.json())
                        .mergeMap((token: string) => {
                            // Call the main site to get the masterKey
                            // build authorization header
                            const authHeader = new Headers();
                            authHeader.append('Authorization', `Bearer ${token}`);
                            return this._http.get(context.urlTemplates.masterKeyUrl, { headers: authHeader })
                                .catch((error: FunctionsResponse) => {
                                    if (error.status === 405) {
                                        // If the result from calling the API above is 405, that means they are running on an older runtime.
                                        // It should be safe to call kudu for the master key since they won't be using slots.
                                        return this._http.get(context.urlTemplates.deprecatedKuduMasterKeyUrl, { headers: this._getScmSiteHeaders(context) });
                                    } else {
                                        throw error;
                                    }
                                })
                                .retryWhen(error => error.scan((errorCount: number, err: FunctionsResponse) => {
                                    if (err.isHandled || (err.status < 500 && err.status !== 401) || errorCount >= 30) {
                                        throw err;
                                    } else {
                                        return errorCount + 1;
                                    }
                                }, 0).delay(1000))
                                .catch(e => this._http.get(context.urlTemplates.runtimeStatusUrl, { headers: authHeader })
                                    .do(null, _ => this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                        message: this._translateService.instant(PortalResources.error_functionRuntimeIsUnableToStart),
                                        errorId: ErrorIds.functionRuntimeIsUnableToStart,
                                        errorType: ErrorType.Fatal,
                                        resourceId: context.site.id
                                    })).map(_ => { throw e; })) // if /status call is successful, then throw the original error
                                .do((r: Response) => {
                                    // Since we fall back to kudu above, use a union of kudu and runtime types.
                                    const key: { name: string, value: string } & { masterKey: string } = r.json();
                                    if (key.masterKey) {
                                        context.masterKey = key.masterKey;
                                    } else {
                                        context.masterKey = key.value;
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
                                            resourceId: context.site.id
                                        });
                                        this._trackEvent(context, ErrorIds.unableToDecryptKeys, {
                                            content: error.text(),
                                            status: error.status.toString()
                                        });
                                        return;
                                    } else if (exception.message || exception.messsage) {
                                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                            message: exception.message || exception.messsage,
                                            errorId: ErrorIds.unableToDecryptKeys,
                                            errorType: ErrorType.RuntimeError,
                                            resourceId: context.site.id
                                        });
                                        this._trackEvent(context, ErrorIds.unableToDecryptKeys, {
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
                                    resourceId: context.site.id
                                });
                                this._trackEvent(context, ErrorIds.unableToRetrieveRuntimeKeyFromScm, {
                                    status: error.status.toString(),
                                    content: error.text(),
                                });
                            }
                        });
            });
    }

    fireSyncTrigger(context: FunctionAppContext) {
        const url = context.urlTemplates.syncTriggersUrl;
        this._http.post(url, '', { headers: this._getScmSiteHeaders(context) })
            .subscribe(success => console.log(success), error => console.log(error));
    }

    private _getHostToken(context: FunctionAppContext) {
        return ArmUtil.isLinuxApp(context.site)
            ? this._http.get(Constants.serviceHost + `api/runtimetoken${context.site.id}`, { headers: this._getPortalHeaders() })
            : this._http.get(context.urlTemplates.scmTokenUrl, { headers: this._getScmSiteHeaders(context) });
    }

    private _checkIfSourceControlEnabled(site: ArmObj<Site>): Observable<boolean> {
        return this._cacheService.getArm(`${site.id}/config/web`)
            .map(r => {
                const config: ArmObj<SiteConfig> = r.json();
                return !config.properties['scmType'] || config.properties['scmType'] !== 'None';
            })
            .catch(() => Observable.of(false));
    }

    // to talk to scm site
    private _getScmSiteHeaders(context: FunctionAppContext, contentType?: string): Headers {
        contentType = contentType || 'application/json';

        const headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');
        if (!this._globalStateService.showTryView && this._token) {
            headers.append('Authorization', `Bearer ${this._token}`);
        }

        if (this._tryFunctionsService.functionContainer && this._tryFunctionsService.functionContainer.tryScmCred) {
            headers.append('Authorization', `Basic ${this._tryFunctionsService.functionContainer.tryScmCred}`);
        }

        if (context.masterKey) {
            headers.append('x-functions-key', context.masterKey);
        }

        return headers;
    }

    // to talk to Functions Portal
    private _getPortalHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        const headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this._token) {
            headers.append('client-token', this._token);
            headers.append('portal-token', this._token);
        }

        return headers;
    }

    /**
     * This function is just a wrapper around AiService.trackEvent. It injects default params expected from this class.
     * Currently that's only scmUrl
     * @param params any additional parameters to get added to the default parameters that this class reports to AppInsights
     */
    private _trackEvent(context: FunctionAppContext, name: string, params: { [name: string]: string }) {
        const standardParams = {
            scmUrl: context.urlTemplates.pingScmSiteUrl
        };

        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                standardParams[key] = params[key];
            }
        }

        this._aiService.trackEvent(name, standardParams);
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

    private sanitize(value: string): string {
        if (value) {
            return value.substring(0, Math.min(3, value.length));
        } else {
            return 'undefined';
        }
    }

    private getMainSiteHeaders(context: FunctionAppContext, contentType?: string): Headers {
        contentType = contentType || 'application/json';
        const headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');
        headers.append('x-functions-key', context.masterKey);
        return headers;
    }
}
