import { Component, OnInit } from '@angular/core';
import { DeploymentCenterWizardService } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-wizard-service';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { Observable } from 'rxjs/Observable';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';

@Component({
    selector: 'app-step-complete',
    templateUrl: './step-complete.component.html',
    styleUrls: ['./step-complete.component.scss']
})
export class StepCompleteComponent implements OnInit {
    resourceId: string;
    private _busyManager: BusyStateScopeManager;

    constructor(
        public wizard: DeploymentCenterWizardService,
        cacheService: CacheService,
        private _armService: ArmService,
        private _broadcastService: BroadcastService
    ) {
        this._busyManager = new BusyStateScopeManager(_broadcastService, 'site-tabs');

        this.wizard.resourceIdStream.subscribe(r => {
            this.resourceId = r;
        });
    }

    get summaryItems() {
        return this.wizard.summaryItems;
    }
    Save() {
        this._busyManager.setBusy();
        let payload = this.wizard.wizardForm.controls.sourceSettings.value;
        if (this.wizard.wizardForm.controls.sourceProvider.value === 'external') {
            payload.isManualIntegration = true;
        }

        Observable.zip(
            this._armService.put(`${this.resourceId}/sourcecontrols/web`, {
                properties: this.wizard.wizardForm.controls.sourceSettings.value
            }),
            t => ({
                sc: t.json()
            })
        )
            .do(r => {
                this._busyManager.clearBusy();
            })
            .subscribe(r => {
                this._busyManager.clearBusy();
                this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter);
            });
    }
    ngOnInit() {}
}
