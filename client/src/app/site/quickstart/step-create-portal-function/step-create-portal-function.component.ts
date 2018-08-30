import { FunctionAppContext } from 'app/shared/function-app-context';
import { FunctionInfo } from './../../../shared/models/function-info';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Component, OnInit } from '@angular/core';
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
import { Observable } from 'rxjs/Observable';
import { workerRuntimeOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';

@Component({
    selector: 'step-create-portal-function',
    templateUrl: './step-create-portal-function.component.html',
    styleUrls: ['./step-create-portal-function.component.scss', '../quickstart.component.scss']
})
export class StepCreatePortalFunctionComponent implements OnInit {

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
    public markdownFile: string;
    public templates: FunctionTemplate[];
    public functionsInfo: FunctionInfo[];

    constructor(
        private _wizardService: QuickstartStateManager,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService,
        private _functionAppService: FunctionAppService,
        private _broadcastService: BroadcastService
    ) {
    }

    ngOnInit() {
        return Observable.zip(
            this._functionAppService.getTemplates(this.context),
            this._functionAppService.getFunctions(this.context))
        .subscribe((r) => {
                this.templates = r[0].isSuccessful ? r[0].result : null;
                this.functionsInfo = r[1].isSuccessful ? r[1].result : null;
        });
    }

    get context(): FunctionAppContext {
        return this._wizardService.context.value;
    }

    get workerRuntime(): workerRuntimeOptions {
        return this._wizardService.workerRuntime.value;
    }
    get language(): string {
        return WorkerRuntimeLanguages[this.workerRuntime] === 'C#' ? 'CSharp' : WorkerRuntimeLanguages[this.workerRuntime];
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
            if (!!this.templates && !!this.functionsInfo) {
                const selectedTemplate: FunctionTemplate = this.templates.find((t) => {
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
                };
            this._globalStateService.clearBusyState();
        }
    }
}
