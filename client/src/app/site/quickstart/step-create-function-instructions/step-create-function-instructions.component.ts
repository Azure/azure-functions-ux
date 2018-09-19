import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { SiteTabIds } from 'app/shared/models/constants';
import { deploymentOptions, workerRuntimeOptions } from './../wizard-logic/quickstart-models';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { FunctionAppContext } from 'app/shared/function-app-context';

@Component({
    selector: 'step-create-function-instructions',
    templateUrl: './step-create-function-instructions.component.html',
    styleUrls: ['./step-create-function-instructions.component.scss', '../quickstart.component.scss'],
})
export class StepCreateFunctionInstructionsComponent implements OnDestroy {

    public instructions: string;
    public deployment: deploymentOptions;
    public workerRuntime: workerRuntimeOptions;
    public context: FunctionAppContext;
    public subscriptionName: string;
    public finishButtonText: string;

    private _ngUnsubscribe = new Subject();

    constructor(
        private _wizardService: QuickstartStateManager,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService) {

        this.instructions = this._wizardService.instructions.value;
        this.deployment = this._wizardService.deployment.value;
        this.workerRuntime = this._wizardService.workerRuntime.value;
        this.context = this._wizardService.context.value;
        this.subscriptionName = this._wizardService.subscriptionName.value;

        this._wizardService.instructions.statusChanges
            .takeUntil(this._ngUnsubscribe)
            .subscribe(() => {
                this.instructions = this._wizardService.instructions.value
                    .replace('{workerRuntime}', this.workerRuntime)
                    .replace('{functionAppName}', this.context.site.name)
                    .replace('{subscriptionName}', this.subscriptionName);
            });

        this._wizardService.deployment.statusChanges
            .takeUntil(this._ngUnsubscribe)
            .subscribe(() => {
                this.deployment = this._wizardService.deployment.value;
                if (this.deployment === 'deploymentCenter') {
                    this.finishButtonText = this._translateService.instant(PortalResources.finishAndDeploy);
                } else {
                    this.finishButtonText = this._translateService.instant(PortalResources.finish);
                }
            });

        this._wizardService.workerRuntime.statusChanges
            .takeUntil(this._ngUnsubscribe)
            .subscribe(() => {
                this.workerRuntime = this._wizardService.workerRuntime.value;
            });

        this._wizardService.context.statusChanges
            .takeUntil(this._ngUnsubscribe)
            .subscribe(() => {
                this.context = this._wizardService.context.value;
            });

        this._wizardService.subscriptionName.statusChanges
            .takeUntil(this._ngUnsubscribe)
            .subscribe(() => {
                this.subscriptionName = this._wizardService.subscriptionName.value;
            });
    }

    public closeTab() {
        if (this.deployment === 'deploymentCenter') {
            this._broadcastService.broadcastEvent(BroadcastEvent.OpenTab, SiteTabIds.continuousDeployment);
        }
        this._broadcastService.broadcastEvent(BroadcastEvent.CloseTab, SiteTabIds.quickstart);
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
    }
}
