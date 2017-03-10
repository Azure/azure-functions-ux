import { ErrorIds } from './../shared/models/error-ids';
import {Component, ViewChild, AfterViewInit, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FunctionsService} from '../shared/services/functions.service';
import {BroadcastService} from '../shared/services/broadcast.service';
import {UserService} from '../shared/services/user.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {BindingType} from '../shared/models/binding';
import {FunctionTemplate} from '../shared/models/function-template';
import {FunctionInfo} from '../shared/models/function-info';
import {TutorialEvent, TutorialStep} from '../shared/models/tutorial';
import {BindingManager} from '../shared/models/binding-manager';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import {GlobalStateService} from '../shared/services/global-state.service';
import {UIResource} from '../shared/models/ui-resource';
import {FunctionContainer} from '../shared/models/function-container';
import {BusyStateComponent} from '../busy-state/busy-state.component';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {AiService} from '../shared/services/ai.service';

@Component({
  selector: 'try-landing',
  templateUrl: './try-landing.component.html',
  styleUrls: ['./try-landing.component.css']
})
export class TryLandingComponent implements OnInit {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @Output() tryFunctionsContainer: EventEmitter<FunctionContainer>;
    public functionsInfo: FunctionInfo[] = new Array();
    bc: BindingManager = new BindingManager();
    loginOptions: boolean = false;
    selectedFunction: string;
    selectedLanguage: string;
    constructor(private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _userService: UserService,
        private _translateService: TranslateService,
        private _aiService: AiService

    ) {
        this.tryFunctionsContainer = new EventEmitter<FunctionContainer>();
    }

    ngOnInit() {
        //Disabling this temporarily. Somehow ngOnInit gets called twice on refresh
        //possibly related to https://github.com/angular/angular/issues/6782
        //and strangely the clearbusystate doesnt get called.
        //this.setBusyState();
        this.selectedFunction = this._functionsService.selectedFunction || 'TimerTrigger';
        this.selectedLanguage = this._functionsService.selectedLanguage || 'CSharp';
        this._functionsService.getTemplates().subscribe((templates) => {
            if (this._globalStateService.TryAppServiceToken) {
                var selectedTemplate: FunctionTemplate = templates.find((t) => {
                    return t.id === this.selectedFunction + "-" + this.selectedLanguage;
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

        var result = this._functionsService.getNewFunctionNode();
        this.functionsInfo.push(result);
    }

    onFunctionClicked(selectedFunction: string) {
        if (!this._broadcastService.getDirtyState("function_disabled")) {
            this.selectedFunction = selectedFunction;
        }
    }

    onLanguageClicked(selectedLanguage: string) {
        if (!this._broadcastService.getDirtyState("function_disabled")) {
            this.selectedLanguage = selectedLanguage;
        }
    }

    handleLoginClick(provider: string) {
        this._functionsService.getTemplates().subscribe((templates) => {
            var selectedTemplate: FunctionTemplate = templates.find((t) => {
                return t.id === this.selectedFunction + "-" + this.selectedLanguage;
            });
            if (provider === '') {
                //clicked on "Create this Function" button
                this.loginOptions = true;
            }
            else
                if (selectedTemplate) {
                    try {
                        var functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                        this.bc.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

                        this.setBusyState();
                        //login
                        //get trial account
                        this._functionsService.createTrialResource(selectedTemplate, provider, functionName)
                            .subscribe((resource) => {
                                this.clearBusyState();
                                this.createFunctioninResource(resource, selectedTemplate, functionName);
                            }, error => {
                                if (error.status === 401 || error.status === 403) {
                                    //show login options
                                    var headerObject = JSON.parse(JSON.stringify(error.headers))["LoginUrl"];
                                    if (provider !== "" && headerObject && headerObject[0]) {
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
                                        errorType: ErrorType.Warning
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
                            errorType: ErrorType.Warning
                        });
                        throw e;
                    }
                }
        });
    }

    createFunctioninResource(resource: UIResource, selectedTemplate: FunctionTemplate, functionName: string) {
        var scmUrl = resource.gitUrl.substring(0, resource.gitUrl.lastIndexOf('/'));
        var encryptedCreds = btoa(scmUrl.substring(8, scmUrl.indexOf('@')));
        // TODO: find a better way to handle this
        var tryfunctionContainer = <FunctionContainer>{
            id: resource.csmId,
            name: resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length),
            type: "Microsoft.Web/sites",
            kind: "functionapp",
            location: "West US",
            properties: {
                hostNameSslStates: [
                    {
                        name: (resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length) + ".scm.azurewebsites.net"),
                        hostType: 1
                    },
                    {
                        name: (resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length) + ".azurewebsites.net"),
                        hostType: 0
                    }],
                sku: "Free",
                containerSize: 128,
                enabled: true,
                state: "Running",
                defaultHostName: (resource.csmId.substring(resource.csmId.lastIndexOf('/') + 1, resource.csmId.length) + ".azurewebsites.net")
            },
            tryScmCred: encryptedCreds
        };
        this._functionsService.setScmParams(tryfunctionContainer);
        this._userService.setTryUserName(resource.userName);
        this.setBusyState();
        this._functionsService.getFunctionContainerAppSettings(tryfunctionContainer)
            .subscribe(a => this._globalStateService.AppSettings = a);
        this._functionsService.createFunctionV2(functionName, selectedTemplate.files, selectedTemplate.function)
            .subscribe(res => {
                this.clearBusyState();
                this._aiService.trackEvent("new-function", { template: selectedTemplate.id, result: "success", first: "true" });
                this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                this.tryFunctionsContainer.emit(tryfunctionContainer);
            },
            e => {
                this.clearBusyState();
                this._aiService.trackEvent("new-function", { template: selectedTemplate.id, result: "failed", first: "true" });
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: `${this._translateService.instant(PortalResources.tryLanding_functionError)}`,
                    details: `${this._translateService.instant(PortalResources.tryLanding_functionErrorDetails)}: ${JSON.stringify(e)}`,
                    errorId: ErrorIds.tryAppServiceError,
                    errorType: ErrorType.Warning
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