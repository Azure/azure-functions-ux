import {Component, Input} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {BroadcastService} from '../services/broadcast.service';
import  {BroadcastEvent} from '../models/broadcast-event'
import {BindingType} from '../models/binding';
import {FunctionTemplate} from '../models/function-template';
import {FunctionInfo} from '../models/function-info';
import {PortalService} from '../services/portal.service';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {BindingManager} from '../models/binding-manager';
import {ErrorEvent} from '../models/error-event';

@Component({
    selector: 'intro',
    templateUrl: './templates/intro.component.html',
    styleUrls: ['styles/intro.style.css']
})

export class IntroComponent {
    @Input() functionsInfo: FunctionInfo[];
    selectedFunction: string;
    bc: BindingManager = new BindingManager();

    constructor( private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService) {

        this.selectedFunction = "timer";
    }

    onFunctionCliked(selectedFunction: string) {
        if (!this._broadcastService.getDirtyState("function_disabled")) {
            this.selectedFunction = selectedFunction;
        }
    }

    onCreateNewFunction() {
        this._functionsService.getTemplates().subscribe((templates) => {
            var selectedTemplate: FunctionTemplate;

            switch (this.selectedFunction) {
                case 'timer':
                    selectedTemplate = templates.find((t) => (t.id === "TimerTrigger-NodeJS"));
                    break;
                case 'data':
                    selectedTemplate = templates.find((t) => (t.id === "QueueTrigger-NodeJS"));
                    break;
                case 'webhook':
                    selectedTemplate = templates.find((t) => (t.id === "HttpTrigger-NodeJS"));
                    break;
                //case 'iot':
                //    selectedTemplate = templates.find((t) => (t.id === "EventHubTrigger"));
                //    break;
            }

            if (selectedTemplate) {
                try{
                    this._portalService.logAction('intro-create-from-template', 'creating', { template: selectedTemplate.id });

                    var functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                    this.bc.setDefaultValues(selectedTemplate.function.bindings, this._functionsService.getDefaultStorageAccount());

                    selectedTemplate.files["function.json"] = JSON.stringify(selectedTemplate.function);

                    this._broadcastService.setBusyState();
                    this._functionsService.createFunctionV2(functionName, selectedTemplate.files)
                        .subscribe(res => {
                            this._portalService.logAction('intro-create-from-template', 'success', { template: selectedTemplate.id });
                            this._broadcastService.broadcast<TutorialEvent>(
                                BroadcastEvent.TutorialStep,
                                {
                                    functionInfo: res,
                                    step: TutorialStep.Waiting
                                });
                            this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                            this._broadcastService.clearBusyState();
                        },
                        e => {
                            this._portalService.logAction('intro-create-from-template', 'failed', { template: selectedTemplate.id });
                            this._broadcastService.clearBusyState();
                            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: 'Function creation error! Please try again.', details: `Create Function Error: ${JSON.stringify(e)}` });
                        });
                }
                catch(e){
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: 'Function creation error! Please try again.', details: `Create Function Error: ${JSON.stringify(e)}` });
                    throw e;
                }
            }

        });
    }

    createFromScratch() {
        this._portalService.logAction('intro-create-from-scratch', 'created');
        this._broadcastService.broadcast(BroadcastEvent.FunctionSelected, this.functionsInfo[0]);
    }

    startFromSC() {
        this._portalService.openBlade("ContinuousDeploymentListBlade", "intro");
    }
}