import { FunctionAppContext } from 'app/shared/function-app-context';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { PortalTemplateCard } from 'app/site/quickstart/Models/portal-function-card';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { BindingManager } from 'app/shared/models/binding-manager';
import { GlobalStateService } from 'app/shared/services/global-state.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionTemplate } from 'app/shared/models/function-template';
import { WorkerRuntimeLanguages } from 'app/shared/models/constants';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { FunctionInfo } from 'app/shared/models/function-info';

@Component({
    selector: 'step-create-function',
    templateUrl: './step-create-function.component.html',
    styleUrls: ['./step-create-function.component.scss', '../quickstart.component.scss']
})
export class StepCreateFunctionComponent {

    public readonly portalTemplateCards: PortalTemplateCard[] = [
        {
            id: 'HttpTrigger',
            name: this._translateService.instant(PortalResources.intro_webHook),
            icon: 'image/http.svg',
            color: '#731DDA',
            description: this._translateService.instant(PortalResources.httpCardDescription)
        },
        {
            id: 'TimerTrigger',
            name: this._translateService.instant(PortalResources.intro_timer),
            icon: 'image/timer.svg',
            color: '#3C86FF',
            description: this._translateService.instant(PortalResources.timerCardDescription)
        }
    ];

    public selectedPortalTemplateCard: PortalTemplateCard = null;
    public bindingManager: BindingManager = new BindingManager();

    constructor(
        public _wizardService: QuickstartStateManager,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService,
        private _functionAppService: FunctionAppService,
        private _broadcastService: BroadcastService
    ) {
    }

    get createPortalFunction(): boolean {
        const devEnvironment = this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls &&
            this._wizardService.wizardForm.controls['devEnvironment'] &&
            this._wizardService.wizardForm.controls['devEnvironment'].value;
        return devEnvironment === 'portal';
    }

    get context(): FunctionAppContext {
        return this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls &&
            this._wizardService.wizardForm.controls['context'] &&
            this._wizardService.wizardForm.controls['context'].value;
    }

    get functionsInfo(): FunctionInfo[] {
        return this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls &&
            this._wizardService.wizardForm.controls['functionsInfo'] &&
            this._wizardService.wizardForm.controls['functionsInfo'].value;
    }

    get language(): string {
        const workerRuntime = this._wizardService &&
            this._wizardService.wizardForm &&
            this._wizardService.wizardForm.controls &&
            this._wizardService.wizardForm.controls['workerRuntime'] &&
            this._wizardService.wizardForm.controls['workerRuntime'].value;
        return WorkerRuntimeLanguages[workerRuntime] === 'C#' ? 'CSharp' : WorkerRuntimeLanguages[workerRuntime];
    }

    public selectPortalTemplate(card: PortalTemplateCard) {
        this.selectedPortalTemplateCard = card;
        const currentFormValues = this._wizardService.wizardValues;
        currentFormValues.portalTemplate = card.id;
        this._wizardService.wizardValues = currentFormValues;
    }

    create() {
        if (!this._globalStateService.IsBusy) {

            this._globalStateService.setBusyState();

            this._functionAppService.getTemplates(this.context)
                .subscribe((templates) => {
                    if (templates.isSuccessful) {
                        const selectedTemplate: FunctionTemplate = templates.result.find((t) => {
                            return t.id === this.selectedPortalTemplateCard.id + '-' + this.language;
                        });

                        if (selectedTemplate) {
                            try {
                                const functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                                this.bindingManager.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);
                                this._functionAppService.createFunction(this.context, functionName, selectedTemplate.files, selectedTemplate.function)
                                    .subscribe(res => {
                                        if (res.isSuccessful) {
                                            this._broadcastService.broadcastEvent(BroadcastEvent.TreeUpdate, {
                                                operation: 'newFunction',
                                                data: res.result
                                            });
                                        }
                                    });
                            } catch (e) {
                                throw e;
                            }
                        }
                    }
                });
            this._globalStateService.clearBusyState();
        }
    }
}
