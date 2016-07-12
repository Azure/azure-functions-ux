import {Component, Input, Output ,EventEmitter} from '@angular/core';
import {FunctionsService} from '../services/functions.service';
import {BroadcastService} from '../services/broadcast.service';
import {UserService} from '../services/user.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {BindingType} from '../models/binding';
import {FunctionTemplate} from '../models/function-template';
import {FunctionInfo} from '../models/function-info';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {BindingManager} from '../models/binding-manager';
import {ErrorEvent} from '../models/error-event';
import {GlobalStateService} from '../services/global-state.service';
import {UIResource} from '../models/ui-resource';
import {FunctionContainer} from '../models/function-container';

@Component({
    selector: 'try-landing',
    templateUrl: 'templates/try-landing.component.html',
    styleUrls: ['styles/try-landing.style.css']
})

export class TryLandingComponent {
    @Output() tryFunctionsContainer: EventEmitter<FunctionContainer>;
    public functionsInfo: FunctionInfo[] = new Array();
     bc: BindingManager = new BindingManager();
    loginOptions: boolean = false;
    selectedFunction: string;
    selectedLanguage: string;

    constructor(private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _userService: UserService
        ) {

        this.tryFunctionsContainer = new EventEmitter<FunctionContainer>();
        if (this._functionsService.tryAppserviceToken) {
            this.selectedFunction = this._functionsService.selectedFunction;
            this.selectedLanguage = this._functionsService.selectedLanguage;

                    this._functionsService.getTemplates().subscribe((templates) => {
                            var selectedTemplate: FunctionTemplate = templates.find((t) => {
                                return t.id === this._functionsService.selectedFunction + "-" + this._functionsService.selectedLanguage;
                            });

                            if (selectedTemplate) {
                                this._functionsService.createTrialResource(selectedTemplate,
                                    this._functionsService.selectedProvider, this._functionsService.selectedFunctionName)
                                    .subscribe((resource) => {
                                        this.createFunctioninResource(resource, selectedTemplate, this._functionsService.selectedFunctionName);
                                    },
                                            error => {
                                                if (error.status === 400) {
                                                    // If there is already a free resource assigned ,
                                                    // we'll get a HTTP 400 ..so lets get it.
                                                    this._functionsService.getTrialResource(this._functionsService.selectedProvider)
                                                        .subscribe((resource) => {
                                                            this.createFunctioninResource(resource, selectedTemplate, this._functionsService.selectedFunctionName);
                                                            }
                                                        );
                                                }
                                            }
                                        )

                                    ;
                            }
});
        } else {
            this.selectedFunction = "TimerTrigger";
            this.selectedLanguage = "CSharp";
        }
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

    createFunctioninResource(resource: UIResource, selectedTemplate: FunctionTemplate, functionName: string) {
        //this.uiResource = resource;
        var scmUrl = resource.gitUrl.substring(0, resource.gitUrl.lastIndexOf('/'));
        var encryptedCreds = btoa(scmUrl.substring(8, scmUrl.indexOf('@')));
        var tryfunctionContainer = <FunctionContainer>{
            id: resource.csmId,
            name: resource.csmId.substring(resource.csmId.lastIndexOf('/'), resource.csmId.length),
            type: "Microsoft.Web/sites",
            kind: "functionapp",
            location: "West US",
            properties: {
                hostNameSslStates: [
                    {
                        name: (resource.csmId.substring(resource.csmId.lastIndexOf('/'), resource.csmId.length) + ".scm.azurewebsites.net"),
                        hostType: 1
                    },
                    {
                        name: (resource.csmId.substring(resource.csmId.lastIndexOf('/'), resource.csmId.length) + ".azurewebsites.net"),
                        hostType: 0
                    }],
                sku: "Free",
                containerSize: 128
            },
            tryScmCred: encryptedCreds
        };
        this._functionsService.setScmParams(tryfunctionContainer);
        this._userService.setTryAppServiceUser(true);
        // add the conenction information for functions created by try.
        if (selectedTemplate.id.startsWith("QueueTrigger"))
        selectedTemplate.function.bindings[0].connection = "AzureWebJobsDashboard";
        this._functionsService.createFunctionV2(functionName, selectedTemplate.files, selectedTemplate.function)
            .subscribe(res => {
                this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                this.tryFunctionsContainer.emit(tryfunctionContainer);
                this._globalStateService.clearBusyState();
            },
            e => {
                this._globalStateService.clearBusyState();
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: 'Function creation error! Please try again.', details: `Create Function Error: ${JSON.stringify(e)}` });
            });
    }
}
