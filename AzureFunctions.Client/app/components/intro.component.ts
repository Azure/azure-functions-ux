import {Component, Input} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {BindingType} from '../models/binding';
import {FunctionTemplate} from '../models/function-template';
import {FunctionInfo} from '../models/function-info';

@Component({
    selector: 'intro',
    templateUrl: './templates/intro.component.html',
    styleUrls: ['styles/template-picker.style.css'] 
})

export class IntroComponent {    
    @Input() functionsInfo: FunctionInfo[];
    selectedFunction: string;

    constructor( private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService) {        
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
            }

            if (selectedTemplate) {
                selectedTemplate.files["function.json"] = JSON.stringify(selectedTemplate.function);
                this._functionsService.createFunctionV2(functionName, selectedTemplate.files)
                    .subscribe(res => {
                        window.setTimeout(() => {
                            this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                        }, 1500);
                    });
            }

        });
    }

    createFromScratch() {                
        this._broadcastService.broadcast(BroadcastEvent.FunctionSelected, this.functionsInfo[1]);
    }

    startFromSC() {
    }
}