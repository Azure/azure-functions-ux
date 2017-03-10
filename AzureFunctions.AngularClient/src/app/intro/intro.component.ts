import { AiService } from './../shared/services/ai.service';
import {Component, Input} from '@angular/core';
import {FunctionsService} from '../shared/services/functions.service';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {BindingType} from '../shared/models/binding';
import {FunctionTemplate} from '../shared/models/function-template';
import {FunctionInfo} from '../shared/models/function-info';
import {PortalService} from '../shared/services/portal.service';
import {TutorialEvent, TutorialStep} from '../shared/models/tutorial';
import {BindingManager} from '../shared/models/binding-manager';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import { PortalResources } from '../shared/models/portal-resources';
import { ErrorIds } from "../shared/models/error-ids";

@Component({
  selector: 'intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent {
    @Input() functionsInfo: FunctionInfo[];
    selectedFunction: string;
    selectedLanguage: string;
    bc: BindingManager = new BindingManager();
    public disabled: boolean;

    constructor(private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _aiService: AiService) {

        this.selectedFunction = "TimerTrigger";
        this.selectedLanguage = "CSharp";
        this.disabled = this._broadcastService.getDirtyState("function_disabled");
    }

    onFunctionCliked(selectedFunction: string) {
        if (!this.disabled) {
            this.selectedFunction = selectedFunction;
        }
    }

    onLanguageCliked(selectedLanguage: string) {
        if (!this.disabled) {
            this.selectedLanguage = selectedLanguage;
        }
    }

    onCreateNewFunction() {
        if (this._globalStateService.IsBusy) {
            return;
        }

        this._globalStateService.setBusyState();
        this._functionsService.getTemplates().subscribe((templates) => {
            var selectedTemplate: FunctionTemplate = templates.find((t) => {
                return t.id === this.selectedFunction + "-" + this.selectedLanguage;
            });

            if (selectedTemplate) {
                try {
                    var functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                    this._portalService.logAction('intro-create-from-template', 'creating', { template: selectedTemplate.id, name: functionName });

                    this.bc.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

                    this._functionsService.createFunctionV2(functionName, selectedTemplate.files, selectedTemplate.function)
                        .subscribe(res => {
                            this._portalService.logAction('intro-create-from-template', 'success', { template: selectedTemplate.id, name: functionName });
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
                        });
                }
                catch (e) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.functionCreateErrorMessage),
                        details: this._translateService.instant(PortalResources.functionCreateErrorDetails, { error: JSON.stringify(e) }),
                        errorId: ErrorIds.unableToCreateFunction,
                        errorType: ErrorType.UserError
                    });
                    this._aiService.trackEvent(ErrorIds.unableToCreateFunction, {
                        exception: e
                    });
                    throw e;
                }
            } else {
                this._globalStateService.clearBusyState();
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
