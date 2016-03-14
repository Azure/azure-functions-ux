import {Component, Input} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {BindingType} from '../models/binding';
import {FunctionTemplate} from '../models/function-template';
import {FunctionInfo} from '../models/function-info';
import {PortalService} from '../services/portal.service';
import {TutorialEvent, TutorialStep} from '../models/tutorial';

@Component({
    selector: 'intro',
    templateUrl: './templates/intro.component.html',
    styleUrls: ['styles/template-picker.style.css'] 
})

export class IntroComponent {    
    @Input() functionsInfo: FunctionInfo[];
    selectedFunction: string;

    constructor( private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService,
        private _portalService: PortalService) {        
    }

    onFunctionCliked(selectedFunction: string) {
        this.selectedFunction = selectedFunction;
    }

    onCreateNewFunction() {
        this._functionsService.getTemplates().subscribe((templates) => {       
            var functionName: string;
            var selectedTemplate: FunctionTemplate;

            switch (this.selectedFunction) {
                case 'timer':
                    functionName = "timer";
                    selectedTemplate = templates.find((t) => (t.id === "TimerTrigger"));
                    break;
                case 'data':
                    functionName = "data";
                    selectedTemplate = templates.find((t) => (t.id === "QueueTrigger"));
                    break;
                case 'webhook':
                    functionName = "webhook";
                    selectedTemplate = templates.find((t) => (t.id === "HttpTrigger"));
                    break;
                case 'iot':
                    functionName = "iot";
                    selectedTemplate = templates.find((t) => (t.id === "EventHubTrigger"));
                    break;
            } 
 
            if (selectedTemplate) {

                selectedTemplate.files["function.json"] = JSON.stringify(selectedTemplate.function);
                this._broadcastService.setBusyState();
                this._functionsService.createFunctionV2(functionName, selectedTemplate.files)
                    .subscribe(res => {
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