import { Component, OnInit } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { CacheService } from 'app/shared/services/cache.service';
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
import { summaryItem } from 'app/site/deployment-center/Models/summary-item';
import { sourceControlProvider } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-setup-models';
import { TranslateService } from '@ngx-translate/core';

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
        private _broadcastService: BroadcastService,
        private _logService: LogService,
        private _translateService: TranslateService
    ) {
        this._busyManager = new BusyStateScopeManager(_broadcastService, 'site-tabs');

        this.wizard.resourceIdStream
            .takeUntil(this._ngUnsubscribe)
            .switchMap(resourceId => {
                this.resourceId = resourceId;
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

    Save() {
        this._busyManager.setBusy();
        this.wizard.Deploy().first().subscribe(
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

    public get summaryItems(): summaryItem[] {
        const summaryItems: summaryItem[] = [];
        const sourceProvider: sourceControlProvider = this.wizard.wizardValues.sourceProvider;

        summaryItems.push({
            name: this._translateService.instant('sourceProvider'),
            value: sourceProvider
        });

        summaryItems.push({
            name: this._translateService.instant('buildProvider'),
            value: 'Kudu'
        });

        if (sourceProvider === 'github' || sourceProvider === 'bitbucket' || sourceProvider === 'vsts' || sourceProvider === 'external') {
            summaryItems.push({
                name: this._translateService.instant('repository'),
                value: this.wizard.wizardForm.controls.sourceSettings.value.repoUrl
            });
            summaryItems.push({
                name: this._translateService.instant('branch'),
                value: this.wizard.wizardForm.controls.sourceSettings.value.branch
            });
        } else if (sourceProvider === 'onedrive' || sourceProvider === 'dropbox') {
            const FolderUrl: string = this.wizard.wizardForm.controls.sourceSettings.value.repoUrl;
            const folderUrlPieces = FolderUrl.split('/');
            const folderName = folderUrlPieces[folderUrlPieces.length - 1];
            summaryItems.push({
                name: 'Folder',
                value: folderName
            });
        } else if (sourceProvider === 'localgit') {
            summaryItems.push({ name: this._translateService.instant('repository'), value: this.LocalGitCloneUri });
            summaryItems.push({ name: this._translateService.instant('branch'), value: 'master' });
        }

        if (sourceProvider === 'external') {
            const isMercurial = this.wizard.wizardForm.controls.sourceSettings.value.isMercurial;
            summaryItems.push({
                name: this._translateService.instant('repoType'),
                value: isMercurial ? 'Mercurial' : 'Git'
            });
        }

        return summaryItems;
    }
    ngOnInit() { }
}
