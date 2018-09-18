import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { SiteTabIds } from 'app/shared/models/constants';
import { deploymentOptions } from './../wizard-logic/quickstart-models';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'step-create-function-instructions',
    templateUrl: './step-create-function-instructions.component.html',
    styleUrls: ['./step-create-function-instructions.component.scss', '../quickstart.component.scss'],
})
export class StepCreateFunctionInstructionsComponent implements OnDestroy {

    public instructions: string;
    public deployment: deploymentOptions;

    private _ngUnsubscribe = new Subject();

    constructor(
        private _wizardService: QuickstartStateManager,
        private _broadcastService: BroadcastService) {

        this.instructions = this._wizardService.instructions.value;
        this.deployment = this._wizardService.deployment.value;

        this._wizardService.instructions.statusChanges
            .takeUntil(this._ngUnsubscribe)
            .subscribe(() => {
                this.instructions = this._wizardService.instructions.value;
            },
        );

        this._wizardService.deployment.statusChanges
            .takeUntil(this._ngUnsubscribe)
            .subscribe(() => {
                this.deployment = this._wizardService.deployment.value;
            },
        );
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
