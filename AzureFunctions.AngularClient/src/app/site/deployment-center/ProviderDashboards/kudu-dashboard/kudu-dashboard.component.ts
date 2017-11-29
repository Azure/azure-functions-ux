import { ArmService } from '../../../../shared/services/arm.service';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { TableItem, TblComponent } from '../../../../controls/tbl/tbl.component';
import { AiService } from '../../../../shared/services/ai.service';
import { AuthzService } from '../../../../shared/services/authz.service';
import { CacheService } from '../../../../shared/services/cache.service';
import { PortalService } from '../../../../shared/services/portal.service';
import { Observable, Subject } from 'rxjs/Rx';
import { Deployment, DeploymentData } from '../../Models/deploymentData';
import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import * as moment from 'moment';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
class KuduTableItem implements TableItem {
    public type: 'row' | 'group';
    public time: string;
    public date: string;
    public status: string;
    public checkinMessage: string;
    public commit: string;
    public author: string;
    public deploymentObj: ArmObj<Deployment>;
}
@Component({
    selector: 'app-kudu-dashboard',
    templateUrl: './kudu-dashboard.component.html',
    styleUrls: ['./kudu-dashboard.component.scss']
})
export class KuduDashboardComponent implements OnChanges {
    @Input() resourceId: string;
    @ViewChild(TblComponent) appTable: TblComponent;
    private _tableItems: KuduTableItem[];

    public viewInfoStream: Subject<string>;
    _viewInfoSubscription: RxSubscription;
    _writePermission = true;
    _readOnlyLock = false;
    public hasWritePermissions = true;
    public deploymentObject: DeploymentData;

    public RightPaneItem: ArmObj<Deployment>;
    private _busyManager: BusyStateScopeManager;
    private _forceLoad = false;
    public sidePanelOpened = false;
    constructor(
        _portalService: PortalService,
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _aiService: AiService,
        private _authZService: AuthzService,
        private _broadcastService: BroadcastService
    ) {
        this._busyManager = new BusyStateScopeManager(_broadcastService, 'site-tabs');
        this._tableItems = [];
        this.viewInfoStream = new Subject<string>();
        this._viewInfoSubscription = this.viewInfoStream
            .switchMap(resourceId => {
                this._busyManager.setBusy();
                return Observable.zip(
                    this._cacheService.getArm(resourceId, this._forceLoad),
                    this._cacheService.getArm(`${resourceId}/config/web`, this._forceLoad),
                    this._cacheService.postArm(`${resourceId}/config/metadata/list`),
                    this._cacheService.postArm(`${resourceId}/config/publishingcredentials/list`, this._forceLoad),
                    this._cacheService.getArm(`${resourceId}/sourcecontrols/web`, this._forceLoad),
                    this._cacheService.getArm(`${resourceId}/deployments`, this._forceLoad),
                    this._cacheService.getArm(`/providers/Microsoft.Web/publishingUsers/web`, this._forceLoad),
                    this._authZService.hasPermission(resourceId, [AuthzService.writeScope]),
                    this._authZService.hasReadOnlyLock(resourceId),
                    (
                        site,
                        siteConfig,
                        metadata,
                        pubCreds,
                        sourceControl,
                        deployments,
                        publishingUser,
                        writePerm: boolean,
                        readLock: boolean
                    ) => ({
                        site: site.json(),
                        siteConfig: siteConfig.json(),
                        metadata: metadata.json(),
                        pubCreds: pubCreds.json(),
                        sourceControl: sourceControl.json(),
                        deployments: deployments.json(),
                        publishingUser: publishingUser.json(),
                        writePermission: writePerm,
                        readOnlyLock: readLock
                    })
                );
            })
            .do(null, error => {
                this._busyManager.clearBusy();
                this._forceLoad = false;
                this.deploymentObject = null;
                this._aiService.trackEvent('/errors/deployment-center', error);
            })
            .retry()
            .subscribe(r => {
                this._busyManager.clearBusy();
                this._forceLoad = false;
                this.deploymentObject = {
                    site: r.site,
                    siteConfig: r.siteConfig,
                    siteMetadata: r.metadata,
                    sourceControls: r.sourceControl,
                    publishingCredentials: r.pubCreds,
                    deployments: r.deployments,
                    publishingUser: r.publishingUser
                };
                this._populateTable();
                setTimeout(() => {
                    this.appTable.groupItems('date', 'desc');
                }, 0);
                this._writePermission = r.writePermission;
                this._readOnlyLock = r.readOnlyLock;
                this.hasWritePermissions = r.writePermission && !r.readOnlyLock;
            });
    }

    private _populateTable() {
        this._tableItems = [];
        const deployments = this.deploymentObject.deployments.value;
        deployments.forEach(value => {
            const item = value.properties;
            const date: Date = new Date(item.end_time);
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
                status: 'Completed',
                author: author,
                deploymentObj: value
            };
            this._tableItems.push(row);
        });
    }
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['resourceId']) {
            this.viewInfoStream.next(this.resourceId);
        }
    }

    get FolderPath() {
        if (this.SourceLocation !== 'Dropbox' && this.SourceLocation !== 'Onedrive') {
            return null;
        }
        const folderPath = this.Repo
            .replace('https://www.dropbox.com/home', '')
            .replace('https://api.onedrive.com/v1.0/drive/special/approot:', '');
        return folderPath;
    }

    get RollbackEnabled() {
        const rollbackEnabled = this.deploymentObject && this.deploymentObject.sourceControls.properties.deploymentRollbackEnabled;
        return rollbackEnabled ? 'Yes' : 'No';
    }
    get Repo(): string {
        return this.deploymentObject && this.deploymentObject.sourceControls.properties.repoUrl;
    }

    get Branch() {
        return this.deploymentObject && this.deploymentObject.sourceControls.properties.branch;
    }

    get ScmType() {
        const isMerc: boolean = this.deploymentObject && this.deploymentObject.sourceControls.properties.isMercurial;
        return isMerc ? 'Mercurial' : 'Git';
    }

    get TableItems() {
        return this._tableItems || [];
    }
    get GitCloneUri() {
        const publishingUsername = this.deploymentObject && this.deploymentObject.publishingUser.properties.publishingUserName;
        const scmUri = this.deploymentObject && this.deploymentObject.publishingCredentials.properties.scmUri.split('@')[1];
        const siteName = this.deploymentObject && this.deploymentObject.site.name;
        return this.deploymentObject && `https://${publishingUsername}@${scmUri}:443/${siteName}.git`;
    }

    SyncScm() {
        this._cacheService
            .postArm(`${this.resourceId}/sync`, true)
            .do(r => {
            })
            .retry()
            .subscribe(r => {
                this._forceLoad = true;
            });
    }

    disconnect() {
        this._busyManager.setBusy()
        this._armService.delete(`${this.deploymentObject.site.id}/sourcecontrols/web`).subscribe(r => {
           this._busyManager.clearBusy();
            this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter);
        });
    }
    refresh() {
        this._forceLoad = true;
        this.viewInfoStream.next(this.resourceId);
    }

    details(item: KuduTableItem) {
        this.RightPaneItem = item.deploymentObj;
        this.sidePanelOpened = true;
    }

    get SourceLocation() {
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
                return 'Onedrive';
            case 'VSO':
                return 'Visual Studio Online';
            default:
                return '';
        }
    }
}
