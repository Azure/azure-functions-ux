import { Router } from '@angular/router';
import { Component, ViewChild, OnInit, OnDestroy, Injector } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { ArmTryService } from './../shared/services/arm-try.service';
import { ArmService } from './../shared/services/arm.service';
import { FunctionApp } from './../shared/function-app';
import { Site } from './../shared/models/arm/site';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { ErrorIds } from './../shared/models/error-ids';
import { TryFunctionsService } from '../shared/services/try-functions.service';
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
import { Url } from "app/shared/Utilities/url";

@Component({
    selector: 'try-landing',
    templateUrl: './try-landing.component.html',
    styleUrls: ['./try-landing.component.scss']
})
export class TryLandingComponent implements OnInit, OnDestroy {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    public functionsInfo: FunctionInfo[] = new Array();
    bc: BindingManager = new BindingManager();
    loginOptions = false;
    selectedFunction: string;
    selectedLanguage: string;

    private _functionApp: FunctionApp;
    private _ngUnsubscribe = new Subject();

    constructor(
        private _tryFunctionsService: TryFunctionsService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _userService: UserService,
        private _translateService: TranslateService,
        private _aiService: AiService,
        private _armService: ArmService,
        private _router: Router,
        private _injector: Injector) {
    }

    ngOnInit() {
        // Disabling this temporarily. Somehow ngOnInit gets called twice on refresh
        // possibly related to https://github.com/angular/angular/issues/6782
        // and strangely the clearbusystate doesnt get called.
        // this.setBusyState();
        this.selectedFunction = this._tryFunctionsService.selectedFunction || 'HttpTrigger';
        this.selectedLanguage = this._tryFunctionsService.selectedLanguage || 'CSharp';

        this._globalStateService.setBusyState();

        this._userService.getStartupInfo()
            .takeUntil(this._ngUnsubscribe)
            .switchMap(info => {
                return this._tryFunctionsService.getTemplates();
            })
            .subscribe(templates => {
                this._globalStateService.clearBusyState();

                if (this._globalStateService.TryAppServiceToken) {
                    const selectedTemplate: FunctionTemplate = templates.find((t) => {
                        return t.id === this.selectedFunction + '-' + this.selectedLanguage;
                    });

                    if (selectedTemplate) {
                        this.setBusyState();
                        this._tryFunctionsService.createTrialResource(selectedTemplate,
                            this._tryFunctionsService.selectedProvider, this._tryFunctionsService.selectedFunctionName)
                            .subscribe((resource) => {
                                this.clearBusyState();
                                this.createFunctioninResource(resource, selectedTemplate, this._tryFunctionsService.selectedFunctionName);
                            },
                            error => {
                                if (error.status === 400) {
                                    // If there is already a free resource assigned ,
                                    // we'll get a HTTP 400 ..so lets get it.
                                    this._tryFunctionsService.getTrialResource(this._tryFunctionsService.selectedProvider)
                                        .subscribe((resource) => {
                                            this.createFunctioninResource(resource, selectedTemplate, this._tryFunctionsService.selectedFunctionName);
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
            functionApp: null,
            context: null
        };

        this.functionsInfo.push(result);
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
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
        this._tryFunctionsService.getTemplates().subscribe((templates) => {
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
                        this._tryFunctionsService.createTrialResource(selectedTemplate, provider, functionName)
                            .subscribe((resource) => {
                                this.clearBusyState();
                                this.createFunctioninResource(resource, selectedTemplate, functionName);
                            }, (error: Response) => {
                                if (error.status === 401 || error.status === 403) {
                                    // show login options
                                    const headerObject = error.headers.get('LoginUrl');
                                    if (provider !== '' && headerObject) {
                                        (<any>window).location = headerObject;
                                        return;
                                    } else {
                                        this.loginOptions = true;
                                    }
                                    this.clearBusyState();
                                } else if (error.status === 400) {
                                    this._tryFunctionsService.getTrialResource(provider)
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
                        hostType: 1,
                        sslState: 'Disabled'
                    },
                    {
                        name: (resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length) + '.azurewebsites.net'),
                        hostType: 0,
                        sslState: 'Disabled'
                    }],
                sku: 'Free',
                containerSize: 128,
                serverFarmId: null,
                enabled: true,
                defaultHostName: (resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length) + '.azurewebsites.net')
            },
            tryScmCred: encryptedCreds
        };

        this._tryFunctionsService.functionContainer = tryfunctionContainer;
        this._functionApp = new FunctionApp(tryfunctionContainer, this._injector);

        (<ArmTryService>this._armService).tryFunctionApp = this._functionApp;

        this._userService.setTryUserName(resource.userName);
        this.setBusyState();

        this._functionApp.createFunctionV2(functionName, selectedTemplate.files, selectedTemplate.function)
            .subscribe(res => {
                this.clearBusyState();
                this._aiService.trackEvent('new-function', { template: selectedTemplate.id, result: 'success', first: 'true' });
                this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                const navId = this._functionApp.site.id.slice(1, this._functionApp.site.id.length).toLowerCase().replace('/providers/microsoft.web', '');
                this._router.navigate([`/resources/${navId}}/functions/${res.name}`], { queryParams: Url.getQueryStringObj() });
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
