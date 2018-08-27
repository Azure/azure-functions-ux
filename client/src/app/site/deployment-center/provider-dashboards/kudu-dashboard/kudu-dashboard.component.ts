import { ArmService } from '../../../../shared/services/arm.service';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { TableItem, TblComponent } from '../../../../controls/tbl/tbl.component';
import { CacheService } from '../../../../shared/services/cache.service';
import { PortalService } from '../../../../shared/services/portal.service';
import { Observable, Subject } from 'rxjs/Rx';
import { Deployment, DeploymentData } from '../../Models/deployment-data';
import { SimpleChanges, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import * as moment from 'moment-mini-ts';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories, SiteTabIds } from 'app/shared/models/constants';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';

enum DeployStatus {
    Pending,
    Building,
    Deploying,
    Failed,
    Success,
}

class KuduTableItem implements TableItem {
    public type: 'row' | 'group';
    public time: string;
    public date: string;
    public status: string;
    public checkinMessage: string;
    public commit: string;
    public author: string;
    public deploymentObj: ArmObj<Deployment>;
    public active?: boolean;
}

@Component({
    selector: 'app-kudu-dashboard',
    templateUrl: './kudu-dashboard.component.html',
    styleUrls: ['./kudu-dashboard.component.scss'],
})
export class KuduDashboardComponent implements OnChanges, OnDestroy {
    @Input() resourceId: string;
    @ViewChild(TblComponent) appTable: TblComponent;

    public viewInfoStream$: Subject<string>;

    public deploymentObject: DeploymentData;
    public redeployEnabled = true;
    public hideCreds = false;
    public rightPaneItem: ArmObj<Deployment>;
    public sidePanelOpened = false;
    private _busyManager: BusyStateScopeManager;
    private _forceLoad = false;
    private _ngUnsubscribe$ = new Subject();
    private _oldTableHash = 0;
    private _tableItems: KuduTableItem[];
    constructor(
        private _portalService: PortalService,
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _broadcastService: BroadcastService,
        private _logService: LogService,
        private _translateService: TranslateService,
    ) {
        this._busyManager = new BusyStateScopeManager(_broadcastService, SiteTabIds.continuousDeployment);
        this._tableItems = [];
        this.viewInfoStream$ = new Subject<string>();
        this.viewInfoStream$
            .takeUntil(this._ngUnsubscribe$)
            .switchMap(resourceId => {
                return Observable.zip(
                    this._cacheService.getArm(resourceId, this._forceLoad),
                    this._cacheService.getArm(`${resourceId}/config/web`, this._forceLoad),
                    this._cacheService.postArm(`${resourceId}/config/publishingcredentials/list`, this._forceLoad),
                    this._cacheService.getArm(`${resourceId}/sourcecontrols/web`, this._forceLoad),
                    this._cacheService.getArm(`${resourceId}/deployments`, true),
                    this._cacheService.getArm(`/providers/Microsoft.Web/publishingUsers/web`, this._forceLoad),
                    (
                        site,
                        siteConfig,
                        pubCreds,
                        sourceControl,
                        deployments,
                        publishingUser,
                    ) => ({
                        site: site.json(),
                        siteConfig: siteConfig.json(),
                        pubCreds: pubCreds.json(),
                        sourceControl: sourceControl.json(),
                        deployments: deployments.json(),
                        publishingUser: publishingUser.json(),
                    }),
                );
            })
            .subscribe(
                r => {
                    this._busyManager.clearBusy();
                    this._forceLoad = false;
                    this.deploymentObject = {
                        site: r.site,
                        siteConfig: r.siteConfig,
                        sourceControls: r.sourceControl,
                        publishingCredentials: r.pubCreds,
                        deployments: r.deployments,
                        publishingUser: r.publishingUser,
                    };
                    this.redeployEnabled = this._redeployEnabled();
                    this._populateTable();
                },
                err => {
                    this._busyManager.clearBusy();
                    this._forceLoad = false;
                    this.deploymentObject = null;
                    this._logService.error(LogCategories.cicd, '/deployment-center-initial-load', err);
                },
            );

        // refresh automatically every 5 seconds
        Observable.timer(5000, 5000).takeUntil(this._ngUnsubscribe$).subscribe(() => {
            this.viewInfoStream$.next(this.resourceId);
        });
    }

    private  _redeployEnabled() {
        const scmProvider = this.deploymentObject.siteConfig.properties.scmType;
        if (scmProvider === 'Dropbox' || scmProvider === 'OneDrive') {
            return this.deploymentObject.sourceControls.properties.deploymentRollbackEnabled;
        }
        return true;
    }
    // https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
    private _hashcode(s: string): number {
        let h = 0;
        const l = s.length;
        let i = 0;

        if (l > 0) {
            while (i < l) {
                // tslint:disable-next-line:no-bitwise
                h = (h << 5) - h + s.charCodeAt(i++) | 0;
            }
        }
        return h;
    };
    private _getTableHash(tb) {
        let hashNumber = 0;
        tb.forEach(item => {
            hashNumber = hashNumber + this._hashcode(JSON.stringify(item));
        });
        return hashNumber;
    }
    private _populateTable() {
        const tableItems = [];
        const deployments = this.deploymentObject.deployments.value;
        deployments.forEach(value => {
            const item = value.properties;
            const date: Date = new Date(item.received_time);
            const t = moment(date);

            const commitId = item.id.substr(0, 7);
            const author = item.author;
            const row: KuduTableItem = {
                type: 'row',
                time: t.format('h:mm:ss A'),
                date: t.format('M/D/YY'),
                commit: commitId,
                checkinMessage: item.message,
                // TODO: Compute status and show appropriate message
                status: this._getStatusString(item.status, item.progress),
                active: item.active,
                author: author,
                deploymentObj: value,
            };
            tableItems.push(row);
        });
        const newHash = this._getTableHash(tableItems);
        if (this._oldTableHash !== newHash) {
            this._tableItems = tableItems;
            setTimeout(() => {
                this.appTable.groupItems('date', 'desc');
            }, 0);
            this._oldTableHash = newHash;
        }
    }

    private _getStatusString(status: DeployStatus, progressString: string): string {
        switch (status) {
            case DeployStatus.Building:
            case DeployStatus.Deploying:
                return progressString;
            case DeployStatus.Pending:
                return this._translateService.instant(PortalResources.pending);
            case DeployStatus.Failed:
                return this._translateService.instant(PortalResources.failed);
            case DeployStatus.Success:
                return this._translateService.instant(PortalResources.success);
            default:
                return '';
        }
    }
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['resourceId']) {
            this._busyManager.setBusy();
            this.viewInfoStream$.next(this.resourceId);
        }
    }

    get folderPath() {
        if (this.sourceLocation !== 'Dropbox' && this.sourceLocation !== 'OneDrive') {
            return null;
        }
        const folderPath = this.repo
            .replace('https://www.dropbox.com/home', '')
            .replace('https://api.onedrive.com/v1.0/drive/special/approot:', '');
        return folderPath;
    }

    get rollbackEnabled() {
        const rollbackEnabled = this.deploymentObject && this.deploymentObject.sourceControls.properties.deploymentRollbackEnabled;
        return rollbackEnabled ? 'Yes' : 'No';
    }
    get repo(): string {
        return this.deploymentObject && this.deploymentObject.sourceControls.properties.repoUrl;
    }

    get branch() {
        return this.deploymentObject && this.deploymentObject.sourceControls.properties.branch;
    }

    get scmType() {
        const isMerc: boolean = this.deploymentObject && this.deploymentObject.sourceControls.properties.isMercurial;
        return isMerc ? 'Mercurial' : 'Git';
    }

    get tableItems() {
        return this._tableItems || [];
    }
    get gitCloneUri() {
        const publishingUsername = this.deploymentObject && this.deploymentObject.publishingUser.properties.publishingUserName;
        const scmUri = this.deploymentObject && this.deploymentObject.publishingCredentials.properties.scmUri.split('@')[1];
        let siteName = this.deploymentObject && this.deploymentObject.site.name;

        // If site is a slot, we only care abou the primary site name, not the slot name
        if (siteName.includes('/')) {
            siteName = siteName.split('/')[0];
        }
        return this.deploymentObject && `https://${publishingUsername}@${scmUri}:443/${siteName}.git`;
    }

    syncScm() {
        this._busyManager.setBusy();
        this._cacheService.postArm(`${this.resourceId}/sync`, true).subscribe(
            r => {
                this.viewInfoStream$.next(this.resourceId);
            },
            err => {
                this._busyManager.clearBusy();
            },
        );
    }

    disconnect() {

        const confirmResult = confirm(this._translateService.instant(PortalResources.disconnectConfirm));

        if (confirmResult) {
            let notificationId = null;
            this._busyManager.setBusy();
            const webConfig = this._armService.patch(`${this.deploymentObject.site.id}/config/web`, {
                properties: {
                    scmType: 'None',
                },
            });

            const sourceControlsConfig = this._armService.delete(`${this.deploymentObject.site.id}/sourcecontrols/web`);

            this._portalService
                .startNotification(this._translateService.instant(PortalResources.disconnectingDeployment), this._translateService.instant(PortalResources.disconnectingDeployment))
                .do(notification => {
                    notificationId = notification.id;
                })
                .concatMap(() => forkJoin(webConfig, sourceControlsConfig))
                .subscribe(r => {
                    this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter);
                    this._portalService.stopNotification(notificationId, true, this._translateService.instant(PortalResources.disconnectingDeploymentSuccess));
                    this._busyManager.clearBusy();
                },
                    err => {
                        this._portalService.stopNotification(notificationId, false, this._translateService.instant(PortalResources.disconnectingDeploymentFail));
                        this._logService.error(LogCategories.cicd, '/disconnect-kudu-dashboard', err);
                    });
        }
    }
    refresh() {
        this._busyManager.setBusy();
        this.viewInfoStream$.next(this.resourceId);
    }

    details(item: KuduTableItem) {
        this.hideCreds = false;
        this.rightPaneItem = item.deploymentObj;
        this.sidePanelOpened = true;
    }

    repoLinkClick() {
        if (this.repo) {
            const win = window.open(this.repo, '_blank');
            win.focus();
        }
    }

    get sourceLocation() {
        const scmType = this.deploymentObject && this.deploymentObject.siteConfig.properties.scmType;
        switch (scmType) {
            case 'BitbucketGit':
            case 'BitbucketHg':
                return 'Bitbucket';
            case 'ExternalGit':
                return 'External Git';
            case 'GitHub':
                return 'GitHub';
            case 'LocalGit':
                return 'Local Git';
            case 'Dropbox':
            case 'DropboxV2':
                return 'Dropbox';
            case 'OneDrive':
                return 'OneDrive';
            case 'VSO':
                return 'Visual Studio Online';
            default:
                return '';
        }
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe$.next();
    }

    tableItemTackBy(index: number, item: KuduTableItem) {
        return item && item.commit; // or item.id
    }

    showDeploymentCredentials() {
        this.hideCreds = true;
        this.sidePanelOpened = true;
    }
}
