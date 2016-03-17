import {Component, Input} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {BindingType} from '../models/binding';
import {FunctionTemplate} from '../models/function-template';
import {FunctionInfo} from '../models/function-info';
import {PortalService} from '../services/portal.service';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {BindingManager} from '../models/binding-manager';

@Component({
    selector: 'intro',
    templateUrl: './templates/intro.component.html',
    styleUrls: ['styles/template-picker.style.css'] 
})

export class IntroComponent {    
    @Input() functionsInfo: FunctionInfo[];
    selectedFunction: string;
    bc: BindingManager = new BindingManager();

    constructor( private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService,
        private _portalService: PortalService) {        
    }

    onFunctionCliked(selectedFunction: string) {
        this.selectedFunction = selectedFunction;
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
                
                var functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                this.bc.setDefaultValues(selectedTemplate.function.bindings, this._functionsService.getDefaultStorageAccount());

                selectedTemplate.files["function.json"] = JSON.stringify(selectedTemplate.function);

                if (selectedTemplate.files["sample.dat"]) {
                    selectedTemplate.files["../../../data/functions/sampledata/" + functionName + ".dat"] = selectedTemplate.files["sample.dat"];
                    delete selectedTemplate.files["sample.dat"];
                }

                this._broadcastService.setBusyState();
                this._functionsService.createFunctionV2(functionName, selectedTemplate.files)
                    .subscribe(res => {
                        if (!res) {
                            this._broadcastService.clearBusyState();
                            alert("Function creation error! Please try again.");
                            return;
                        }

                        this._broadcastService.broadcast<TutorialEvent>(
                            BroadcastEvent.TutorialStep,
                            {
                                functionInfo: res,
                                step: TutorialStep.Waiting
                            });

                        window.setTimeout(() => {
                            this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                            this._broadcastService.clearBusyState();
                        }, 1500);
                    });
            }

        });
    }

    createFromScratch() {                
        this._broadcastService.broadcast(BroadcastEvent.FunctionSelected, this.functionsInfo[1]);
    }

    startFromSC() {        
        this._portalService.openBlade("ContinuousDeploymentListBlade");
    }
}