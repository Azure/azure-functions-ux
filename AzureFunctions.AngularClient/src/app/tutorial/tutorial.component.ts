import { Component } from '@angular/core';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {TutorialEvent, TutorialStep} from '../shared/models/tutorial';
import {FunctionInfo, FunctionInfoHelper} from '../shared/models/function-info';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';


@Component({
  selector: 'tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent {
    public currentStep = TutorialStep.Off;
    public lang: string;
    private initialFunction: FunctionInfo;

    constructor(
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService) {
        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, event => {
            // Gets called only from intro after a template has been selected
            if (event.step === TutorialStep.Waiting) {
                this.currentStep = event.step;
                this.initialFunction = event.functionInfo;
                var t = new FunctionInfoHelper();
                this.lang = FunctionInfoHelper.getLanguage(event.functionInfo);
            }

            // Gets called after the tabs component has completed loading.
            else if (this.currentStep === TutorialStep.Waiting && event.step === TutorialStep.Develop) {
                this.currentStep = event.step;
                this.broadCastCurrentStep();
            }
        });
    }

    nextStep() {

        switch (this.currentStep) {
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

    private broadCastCurrentStep() {
        this._broadcastService.broadcast<TutorialEvent>(
            BroadcastEvent.TutorialStep,
            {
                functionInfo: this.initialFunction,
                step: this.currentStep
            });
    }

    get buttonText() {
        return this.currentStep < TutorialStep.NextSteps ? this._translateService.instant(PortalResources.next) : this._translateService.instant(PortalResources.close);
    }
}
