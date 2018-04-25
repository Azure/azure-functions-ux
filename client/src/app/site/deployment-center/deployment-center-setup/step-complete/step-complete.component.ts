import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';
import { Subject } from 'rxjs/Subject';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories, SiteTabIds } from 'app/shared/models/constants';
import { sourceControlProvider } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-setup-models';

@Component({
    selector: 'app-step-complete',
    templateUrl: './step-complete.component.html',
    styleUrls: ['./step-complete.component.scss', '../deployment-center-setup.component.scss']
})
export class StepCompleteComponent {
    resourceId: string;
    private _busyManager: BusyStateScopeManager;
    private _ngUnsubscribe$ = new Subject();

    constructor(
        public wizard: DeploymentCenterStateManager,
        private _broadcastService: BroadcastService,
        private _logService: LogService
    ) {
        this._busyManager = new BusyStateScopeManager(_broadcastService, SiteTabIds.continuousDeployment);

        this.wizard.resourceIdStream$
            .takeUntil(this._ngUnsubscribe$)
            .subscribe(r => {
                this.resourceId = r;
            });
    }

    Save() {
        this._busyManager.setBusy();
        this.wizard.deploy().first().subscribe(
            r => {
                this.clearBusy();
                this._broadcastService.broadcastEvent<void>(BroadcastEvent.ReloadDeploymentCenter);
            },
            err => {
                this.clearBusy();
                this._logService.error(LogCategories.cicd, '/save-cicd', err);
            }
        );
    }

    clearBusy() {
        this._busyManager.clearBusy();
    }

    renderDashboard() {
        this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter, this.wizard.wizardValues.sourceProvider);
    }

    get showSave(): boolean {
        return !this.showDashboard;
    }

    get showDashboard(): boolean {
        const sourceProvider: sourceControlProvider = this.wizard.wizardValues.sourceProvider;
        return sourceProvider === 'ftp' || sourceProvider === 'webdeploy';
    }
}
