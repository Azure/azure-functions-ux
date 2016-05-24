import { Component } from '@angular/core';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {FunctionInfo} from '../models/function-info';

@Component({
    selector: 'tutorial',
    styleUrls: ['styles/tutorial.style.css'],
    templateUrl: 'templates/tutorial.component.html'
})

export class TutorialComponent {
    public currentStep = TutorialStep.Off;
    private initialFunction: FunctionInfo;

    constructor(private _broadcastService: BroadcastService){
        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, event => {
            // Gets called only from intro after a template has been selected
            if (event.step === TutorialStep.Waiting){
                this.currentStep = event.step;
                this.initialFunction = event.functionInfo;
            }

            // Gets called after the tabs component has completed loading.
            else if (this.currentStep === TutorialStep.Waiting && event.step === TutorialStep.Develop) {
                this.currentStep = event.step;
                this.broadCastCurrentStep();
            }
        });
    }

    nextStep(){

        switch(this.currentStep){
            case TutorialStep.Develop:
                this.currentStep = TutorialStep.Integrate;
                break;
            case TutorialStep.Integrate:
                this.currentStep = TutorialStep.AppSettings;
                break;
            case TutorialStep.AppSettings:
                this.currentStep = TutorialStep.NextSteps;
                break;
            case TutorialStep.NextSteps:
                this.currentStep = TutorialStep.Off;
                this.initialFunction = null;
                break;
            default:
                break;
        }

        if (this.currentStep !== TutorialStep.Off) {
            this.broadCastCurrentStep();
        }
    }

    private broadCastCurrentStep(){
        this._broadcastService.broadcast<TutorialEvent>(
            BroadcastEvent.TutorialStep,
            {
                functionInfo: this.initialFunction,
                step: this.currentStep
            });
    }

    get buttonText(){
        return this.currentStep < TutorialStep.NextSteps ? "Next" : "Close";
    }
}
