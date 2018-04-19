import { SlotsService } from 'app/shared/services/slots.service';
import { Component, ViewChild, OnInit, Output } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';

import { ConfigService } from './../shared/services/config.service';
import { ArmTryService } from './../shared/services/arm-try.service';
import { CacheService } from './../shared/services/cache.service';
import { AuthzService } from './../shared/services/authz.service';
import { LanguageService } from './../shared/services/language.service';
import { ArmService } from './../shared/services/arm.service';
import { FunctionApp } from './../shared/function-app';
import { Site } from './../shared/models/arm/site';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { ErrorIds } from './../shared/models/error-ids';
import { FunctionsService } from '../shared/services/functions.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { UserService } from '../shared/services/user.service';
import { BroadcastEvent } from '../shared/models/broadcast-event'
import { FunctionTemplate } from '../shared/models/function-template';
import { FunctionInfo } from '../shared/models/function-info';
import { BindingManager } from '../shared/models/binding-manager';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import { GlobalStateService } from '../shared/services/global-state.service';
import { UIResource } from '../shared/models/ui-resource';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { PortalResources } from '../shared/models/portal-resources';
import { AiService } from '../shared/services/ai.service';

@Component({
    selector: 'try-landing',
    templateUrl: './try-landing.component.html',
    styleUrls: ['./try-landing.component.scss']
})
export class TryLandingComponent implements OnInit {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Output() tryFunctionApp: Subject<FunctionApp>;
    public functionsInfo: FunctionInfo[] = new Array();
    bc: BindingManager = new BindingManager();
    loginOptions = false;
    selectedFunction: string;
    selectedLanguage: string;

    private _functionApp: FunctionApp;

    constructor(
        private _httpService: Http,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _userService: UserService,
        private _translateService: TranslateService,
        private _aiService: AiService,
        private _armService: ArmService,
        private _cacheService: CacheService,
        private _languageService: LanguageService,
        private _authZService: AuthzService,
        private _configService: ConfigService,
        private _slotsService: SlotsService) {
        this.tryFunctionApp = new Subject<FunctionApp>();
    }

    ngOnInit() {
        // Disabling this temporarily. Somehow ngOnInit gets called twice on refresh
        // possibly related to https://github.com/angular/angular/issues/6782
        // and strangely the clearbusystate doesnt get called.
        // this.setBusyState();
        this.selectedFunction = this._functionsService.selectedFunction || 'HttpTrigger';
        this.selectedLanguage = this._functionsService.selectedLanguage || 'CSharp';
        this._functionsService.getTemplates().subscribe((templates) => {
            if (this._globalStateService.TryAppServiceToken) {
                const selectedTemplate: FunctionTemplate = templates.find((t) => {
                    return t.id === this.selectedFunction + '-' + this.selectedLanguage;
                });

                if (selectedTemplate) {
                    this.setBusyState();
                    this._functionsService.createTrialResource(selectedTemplate,
                        this._functionsService.selectedProvider, this._functionsService.selectedFunctionName)
                        .subscribe((resource) => {
                            this.clearBusyState();
                            this.createFunctioninResource(resource, selectedTemplate, this._functionsService.selectedFunctionName);
                        },
                        error => {
                            if (error.status === 400) {
                                // If there is already a free resource assigned ,
                                // we'll get a HTTP 400 ..so lets get it.
                                this._functionsService.getTrialResource(this._functionsService.selectedProvider)
                                    .subscribe((resource) => {
                                        this.createFunctioninResource(resource, selectedTemplate, this._functionsService.selectedFunctionName);
                                    });
                            } else {
                                this.clearBusyState();
                            }
                        });
                }
            }
        });

        const result = {
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
            functionApp: null
        };

        this.functionsInfo.push(result);
    }

    onFunctionClicked(selectedFunction: string) {
        if (!this._broadcastService.getDirtyState('function_disabled')) {
            this.selectedFunction = selectedFunction;
        }
    }

    onLanguageClicked(selectedLanguage: string) {
        if (!this._broadcastService.getDirtyState('function_disabled')) {
            this.selectedLanguage = selectedLanguage;
        }
    }

    handleLoginClick(provider: string) {
        this._functionsService.getTemplates().subscribe((templates) => {
            const selectedTemplate: FunctionTemplate = templates.find((t) => {
                return t.id === this.selectedFunction + '-' + this.selectedLanguage;
            });
            if (provider === '') {
                // clicked on "Create this Function" button
                this.loginOptions = true;
            }
            else
                if (selectedTemplate) {
                    try {
                        const functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                        this.bc.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

                        this.setBusyState();
                        // login
                        // get trial account
                        this._functionsService.createTrialResource(selectedTemplate, provider, functionName)
                            .subscribe((resource) => {
                                this.clearBusyState();
                                this.createFunctioninResource(resource, selectedTemplate, functionName);
                            }, error => {
                                if (error.status === 401 || error.status === 403) {
                                    // show login options
                                    const headerObject = JSON.parse(JSON.stringify(error.headers))['LoginUrl'];
                                    if (provider !== '' && headerObject && headerObject[0]) {
                                        (<any>window).location = headerObject[0];
                                        return;
                                    } else {
                                        this.loginOptions = true;
                                    }
                                    this.clearBusyState();
                                } else if (error.status === 400) {
                                    this._functionsService.getTrialResource(provider)
                                        .subscribe((resource) => {
                                            this.createFunctioninResource(resource, selectedTemplate, functionName);
                                        }
                                        );
                                } else {
                                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                        message: `${this._translateService.instant(PortalResources.tryLanding_functionError)}`,
                                        details: `${this._translateService.instant(PortalResources.tryLanding_functionErrorDetails)}: ${JSON.stringify(error)}`,
                                        errorId: ErrorIds.tryAppServiceError,
                                        errorType: ErrorType.Warning,
                                        resourceId: 'try-app'
                                    });
                                    this.clearBusyState();
                                    throw error;
                                }
                                this.clearBusyState();
                            });
                    } catch (e) {
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: `${this._translateService.instant(PortalResources.tryLanding_functionError)}`,
                            details: `${this._translateService.instant(PortalResources.tryLanding_functionErrorDetails)}: ${JSON.stringify(e)}`,
                            errorId: ErrorIds.tryAppServiceError,
                            errorType: ErrorType.Warning,
                            resourceId: 'try-app'
                        });
                        throw e;
                    }
                }
        });
    }

    createFunctioninResource(resource: UIResource, selectedTemplate: FunctionTemplate, functionName: string) {
        const scmUrl = resource.gitUrl.substring(0, resource.gitUrl.lastIndexOf('/'));
        const encryptedCreds = btoa(scmUrl.substring(8, scmUrl.indexOf('@')));
        // TODO: find a better way to handle this
        const tryfunctionContainer = <ArmObj<Site>>{
            id: resource.csmId,
            name: resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length),
            type: 'Microsoft.Web/sites',
            kind: 'functionapp',
            location: 'West US',
            properties: {
                state: 'Running',
                hostNames: null,
                hostNameSslStates: [
                    {
                        name: (resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length) + '.scm.azurewebsites.net'),
                        hostType: 1
                    },
                    {
                        name: (resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length) + '.azurewebsites.net'),
                        hostType: 0
                    }],
                sku: 'Free',
                containerSize: 128,
                serverFarmId: null,
                enabled: true,
                defaultHostName: (resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length) + '.azurewebsites.net')
            },
            tryScmCred: encryptedCreds
        };

        this._functionApp = new FunctionApp(
            tryfunctionContainer,
            this._httpService,
            this._userService,
            this._globalStateService,
            this._translateService,
            this._broadcastService,
            this._armService,
            this._cacheService,
            this._languageService,
            this._authZService,
            this._aiService,
            this._configService,
            this._slotsService);

        (<ArmTryService>this._armService).tryFunctionApp = this._functionApp;

        this._userService.setTryUserName(resource.userName);
        this.setBusyState();
        // this._functionApp.getFunctionContainerAppSettings(tryfunctionContainer)
        // .subscribe(a => {
        //     this._globalStateService.AppSettings = a;
        // });
        this._functionApp.createFunctionV2(functionName, selectedTemplate.files, selectedTemplate.function)
            .subscribe(res => {
                this.clearBusyState();
                this._aiService.trackEvent('new-function', { template: selectedTemplate.id, result: 'success', first: 'true' });
                this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                this.tryFunctionApp.next(this._functionApp);
            },
            e => {
                this.clearBusyState();
                this._aiService.trackEvent('new-function', { template: selectedTemplate.id, result: 'failed', first: 'true' });
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: `${this._translateService.instant(PortalResources.tryLanding_functionError)}`,
                    details: `${this._translateService.instant(PortalResources.tryLanding_functionErrorDetails)}: ${JSON.stringify(e)}`,
                    errorId: ErrorIds.tryAppServiceError,
                    errorType: ErrorType.Warning,
                    resourceId: 'try-app'
                });
            });
    }

    setBusyState() {
        if (this.busyState) {
            this.busyState.setBusyState();
        }
    }

    clearBusyState() {
        if (this.busyState) {
            this.busyState.clearBusyState();
        }
    }
}
