import {Component, Input} from '@angular/core';
import {FunctionsService} from '../services/functions.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {BindingType} from '../models/binding';
import {FunctionTemplate} from '../models/function-template';
import {FunctionInfo} from '../models/function-info';
import {PortalService} from '../services/portal.service';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {BindingManager} from '../models/binding-manager';
import {ErrorEvent} from '../models/error-event';
import {GlobalStateService} from '../services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

@Component({
    selector: 'intro',
    templateUrl: './templates/intro.component.html',
    styleUrls: ['styles/intro.style.css'],
    pipes: [TranslatePipe]
})

export class IntroComponent {
    @Input() functionsInfo: FunctionInfo[];
    selectedFunction: string;
    selectedLanguage: string;
    bc: BindingManager = new BindingManager();

    constructor(private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {

        this.selectedFunction = "TimerTrigger";
        this.selectedLanguage = "CSharp";
    }

    onFunctionCliked(selectedFunction: string) {
        if (!this._broadcastService.getDirtyState("function_disabled")) {
            this.selectedFunction = selectedFunction;
        }
    }

    onLanguageCliked(selectedLanguage: string) {
        if (!this._broadcastService.getDirtyState("function_disabled")) {
            this.selectedLanguage = selectedLanguage;
        }
    }

    onCreateNewFunction() {
        this._functionsService.getTemplates().subscribe((templates) => {
            var selectedTemplate: FunctionTemplate = templates.find((t) => {
                return t.id === this.selectedFunction + "-" + this.selectedLanguage;
            });

            if (selectedTemplate) {
                try {
                    var functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                    this._portalService.logAction('intro-create-from-template', 'creating', { template: selectedTemplate.id, name: functionName });

                    this.bc.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

                    this._globalStateService.setBusyState();
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
                            this._portalService.logAction('intro-create-from-template', 'failed', { template: selectedTemplate.id, name: functionName });
                            this._globalStateService.clearBusyState();
                            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                message: this._translateService.instant(PortalResources.functionCreateErrorMessage),
                                details: this._translateService.instant(PortalResources.functionCreateErrorDetails, { error: JSON.stringify(e) })
                            });
                        });
                }
                catch (e) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.functionCreateErrorMessage),
                        details: this._translateService.instant(PortalResources.functionCreateErrorDetails, { error: JSON.stringify(e) })
                    });
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