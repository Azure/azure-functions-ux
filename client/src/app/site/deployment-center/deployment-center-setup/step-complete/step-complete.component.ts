import { Component } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';
import { Subject } from 'rxjs/Subject';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories, SiteTabIds } from 'app/shared/models/constants';
interface SummaryItem {
    label: string;
    value: string;
}
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

    get SummaryGroups(): SummaryItem[][] {
        return [
            this._sourceControlGroup()
        ];
    }
    // 'dropbox' | 'onedrive' | 'github' | 'vsts' | 'external' | 'bitbucket' | 'localgit' | 'ftp' | 'webdeploy' | 'kudu' | 'zip';
    private _sourceControlGroup(): SummaryItem[] {
        const wizValues = this.wizard.wizardValues;
        const sourceProvider = wizValues.sourceProvider;
        const returnSummaryItems = [];
        if (sourceProvider === 'dropbox' || sourceProvider === 'onedrive') {
            returnSummaryItems.push({
                label: 'Folder',
                value: wizValues.sourceSettings.repoUrl
            });
        }

        if (sourceProvider === 'github' || sourceProvider === 'bitbucket' || sourceProvider === 'external' || sourceProvider === 'vsts' || sourceProvider === 'localgit') {
            returnSummaryItems.push({
                label: 'Repository',
                value: wizValues.sourceSettings.repoUrl
            });
            returnSummaryItems.push({
                label: 'Branch',
                value: wizValues.sourceSettings.branch || 'master'
            });
        }
        return returnSummaryItems;
    }
}
