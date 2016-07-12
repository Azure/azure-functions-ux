import {Component, Input} from '@angular/core';
import {FunctionsService} from '../services/functions.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {BindingType} from '../models/binding';
import {FunctionTemplate} from '../models/function-template';
import {FunctionInfo} from '../models/function-info';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {BindingManager} from '../models/binding-manager';
import {ErrorEvent} from '../models/error-event';
import {GlobalStateService} from '../services/global-state.service';
import {UIResource} from '../models/ui-resource';

@Component({
    selector: 'try-landing',
    templateUrl: 'templates/try-landing.component.html',
    styleUrls: ['styles/try-landing.style.css']
})

export class TryLandingComponent {
    public functionsInfo: FunctionInfo[] = new Array();
    selectedFunction: string;
    selectedLanguage: string;
    bc: BindingManager = new BindingManager();
    loginOptions: boolean = false;

    constructor(private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService) {

        this.selectedFunction = "TimerTrigger";
        this.selectedLanguage = "CSharp";
        var result = this._functionsService.getNewFunctionNode();
        this.functionsInfo.push(result);
        if (window.location.search.indexOf("cookie=") >= 0) {

            window.location.replace(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/signin${window.location.search}`);
        }

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

            if (selectedTemplate) {
                try {
                    var functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                    this.bc.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

                    this._globalStateService.setBusyState();
                    //login 
                    //get trial account
                    this._functionsService.createTrialResource(selectedTemplate, provider, functionName)
                        .subscribe((resource) => {
                            this.createFunctioninResource(resource, selectedTemplate, functionName)
                        
                        }, error => {
                            if (error.status === 401 || error.status === 403) {
                                //show login options
                                //var a = JSON.stringify(error.headers);
                                var headerObject = JSON.parse(JSON.stringify(error.headers))["LoginUrl"];
                                if (headerObject && headerObject[0]) {
                                    (<any>window).location = headerObject[0];
                                    return;
                                } else {
                                    this._globalStateService.clearBusyState();
                                    this.loginOptions = true;
                                }
                            } else if (error.status === 400) {
                                this._functionsService.getTrialResource(provider)
                                    .subscribe((resource) => {
                                        this.createFunctioninResource(resource, selectedTemplate, functionName);
                                    }
                                    );
                            } else
                            {
                                this._globalStateService.clearBusyState();
                                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: 'Function creation error! Please try again.', details: `Create Function Error: ${JSON.stringify(error)}` });
                                throw error;
                            }
                        });
                    this._globalStateService.clearBusyState();
                }
                catch (e) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: 'Function creation error! Please try again.', details: `Create Function Error: ${JSON.stringify(e)}` });
                    throw e;
                }
            }

        });
    }

    onCreateNewFunction1(method: string) {
        this.loginOptions = true;
    }

    onCreateNewFunction(method: string) {
        this._functionsService.getTemplates().subscribe((templates) => {
            var selectedTemplate: FunctionTemplate = templates.find((t) => {
                return t.id === this.selectedFunction + "-" + this.selectedLanguage;
            });

            if (selectedTemplate) {
                try {
                    var functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                    this.bc.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

                    this._globalStateService.setBusyState();
                    //login 
                    //get trial account
                    this._functionsService.createTrialResource(selectedTemplate, '', functionName)
                        .subscribe((resource) => {
                            this.createFunctioninResource(resource, selectedTemplate, functionName);
                        }, error => {
                            if (error.status === 401 || error.status === 403) {
                                //show login options
                                if (error.headers["LoginUrl"]) {
                                    (<any>window).location = error.headers["LoginUrl"];
                                    return;
                                } else {
                                    this._globalStateService.clearBusyState();
                                    this.loginOptions = true;
                                }
                            } else if (error.status === 400) {
                                this._functionsService.getTrialResource('')
                                    .subscribe((resource) => {
                                        this.createFunctioninResource(resource, selectedTemplate, functionName);
                                    }
                                    );
                            } else {
                                this._globalStateService.clearBusyState();
                                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: 'Function creation error! Please try again.', details: `Create Function Error: ${JSON.stringify(error)}` });
                                throw error;
                            }
                        });
                }
                catch (e) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: 'Function creation error! Please try again.', details: `Create Function Error: ${JSON.stringify(e)}` });
                    throw e;
                }
            }
        });
    }

    login() {
        window.location.replace(`${window.location.protocol}//${window.location.hostname}/signin${window.location.search}`);
    }

    createFunctioninResource(resource: UIResource, selectedTemplate: FunctionTemplate, functionName: string) {
        //this.uiResource = resource;
        this._functionsService.createFunctionV3(functionName, resource.gitUrl.substring(0, resource.gitUrl.lastIndexOf('/')),  selectedTemplate.files, selectedTemplate.function)
            .subscribe(res => {
                window.location.replace(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/signin${window.location.search}`);
                this._broadcastService.broadcast<TutorialEvent>(
                    BroadcastEvent.TutorialStep,
                    {
                        functionInfo: res,
                        step: TutorialStep.Waiting
                    });
                this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                this._globalStateService.clearBusyState();
            },
            e => {
                this._globalStateService.clearBusyState();
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: 'Function creation error! Please try again.', details: `Create Function Error: ${JSON.stringify(e)}` });
            });
    }
}
