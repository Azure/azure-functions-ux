import { Component, OnInit } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-state-manager';
import { CacheService } from 'app/shared/services/cache.service';
import { ArmService } from 'app/shared/services/arm.service';
import { Observable } from 'rxjs/Observable';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';
import { Subject } from 'rxjs/Subject';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { PublishingCredentials } from 'app/shared/models/publishing-credentials';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories } from 'app/shared/models/constants';

@Component({
    selector: 'app-step-complete',
    templateUrl: './step-complete.component.html',
    styleUrls: ['./step-complete.component.scss', '../deployment-center-setup.component.scss']
})
export class StepCompleteComponent implements OnInit {
    resourceId: string;
    private _busyManager: BusyStateScopeManager;
    private _ngUnsubscribe = new Subject();
    private site: ArmObj<Site>;
    private pubCreds: ArmObj<PublishingCredentials>;
    private pubUserName: ArmObj<{
        publishingUserName: string;
    }>;
    constructor(
        public wizard: DeploymentCenterStateManager,
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _broadcastService: BroadcastService,
        private _logService: LogService
    ) {
        this._busyManager = new BusyStateScopeManager(_broadcastService, 'site-tabs');

        this.wizard.resourceIdStream
            .takeUntil(this._ngUnsubscribe)
            .switchMap(resourceId => {
                return Observable.zip(
                    this._cacheService.getArm(resourceId, false),
                    this._cacheService.postArm(`${resourceId}/config/publishingcredentials/list`, false),
                    this._cacheService.getArm(`/providers/Microsoft.Web/publishingUsers/web`, false),
                    (site, pubCreds, publishingUser) => ({
                        site: site.json(),
                        pubCreds: pubCreds.json(),
                        publishingUser: publishingUser.json()
                    })
                );
            })
            .subscribe(r => {
                this.site = r.site;
                this.pubCreds = r.pubCreds;
                this.pubUserName = r.publishingUser;
            });
    }

    get LocalGitCloneUri() {
        const publishingUsername = this.pubUserName && this.pubUserName.properties.publishingUserName;
        const scmUri = this.pubCreds && this.pubCreds.properties.scmUri.split('@')[1];
        const siteName = this.site && this.site.name;
        return `https://${publishingUsername}@${scmUri}:443/${siteName}.git`;
    }

    get summaryItems() {
        let sumItems = this.wizard.summaryItems;
        if (
            this.wizard.wizardForm.controls &&
            this.wizard.wizardForm.controls.sourceProvider &&
            this.wizard.wizardForm.controls.sourceProvider.value === 'localgit'
        ) {
            sumItems.push({ name: 'Repository', value: this.LocalGitCloneUri });
            sumItems.push({ name: 'Branch', value: 'master' });
        }
        return sumItems;
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
            .subscribe(
                r => {
                    this._busyManager.clearBusy();
                    this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter);
                },
                err => {
                    this._busyManager.clearBusy();
                    this._logService.error(LogCategories.cicd, '/save-cicd', err);
                }
            );
    }
    ngOnInit() { }
}
