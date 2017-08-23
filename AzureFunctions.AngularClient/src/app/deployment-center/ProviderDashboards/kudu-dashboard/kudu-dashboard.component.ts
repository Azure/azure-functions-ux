import { TableItem, TblComponent } from '../../../controls/tbl/tbl.component';
import { AiService } from '../../../shared/services/ai.service';
import { AuthzService } from '../../../shared/services/authz.service';
import { SiteTabComponent } from '../../../site/site-dashboard/site-tab/site-tab.component';
import { CacheService } from '../../../shared/services/cache.service';
import { PortalService } from '../../../shared/services/portal.service';
import { BusyStateScopeManager } from '../../../busy-state/busy-state-scope-manager';
import { Observable, Subject } from 'rxjs/Rx';
import { DeploymentData } from '../../Models/deploymentData';
import { BusyStateComponent } from '../../../busy-state/busy-state.component';
import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import * as moment from 'moment';
class KuduTableItem implements TableItem {
    public type: 'row' | 'group';
    public time: string;
    public date: string;
    public status: string;
    public checkinMessage: string;
    public commit: string;
    public author: string;
}
@Component({
    selector: 'app-kudu-dashboard',
    templateUrl: './kudu-dashboard.component.html',
    styleUrls: ['./kudu-dashboard.component.scss']
})
export class KuduDashboardComponent implements OnChanges {
    @Input() resourceId: string;
    @ViewChild('table') appTable: TblComponent;
    private _tableItems: KuduTableItem[];

    _busyState: BusyStateComponent;
    public viewInfoStream: Subject<string>;
    _viewInfoSubscription: RxSubscription;
    _busyStateScopeManager: BusyStateScopeManager;
    _writePermission = true;
    _readOnlyLock = false;
    public hasWritePermissions = true;
    public deploymentObject: DeploymentData;

    public oAuthToken = '';
    constructor(
        _portalService: PortalService,
        private _cacheService: CacheService,
        private _aiService: AiService,
        private _authZService: AuthzService,
        siteTabsComponent: SiteTabComponent
    ) {
        this._busyState = siteTabsComponent.busyState;
        this._busyStateScopeManager = this._busyState.getScopeManager();
        this._tableItems = [];
        this.viewInfoStream = new Subject<string>();
        this._viewInfoSubscription = this.viewInfoStream
            .distinctUntilChanged()
            .switchMap(resourceId => {
                this._busyStateScopeManager.setBusy();
                return Observable.zip(
                    this._cacheService.getArm(resourceId),
                    this._cacheService.getArm(`${resourceId}/config/web`),
                    this._cacheService.postArm(
                        `${resourceId}/config/metadata/list`
                    ),
                    this._cacheService.postArm(
                        `${resourceId}/config/publishingcredentials/list`
                    ),
                    this._cacheService.getArm(
                        `${resourceId}/sourcecontrols/web`
                    ),
                    this._cacheService.getArm(`${resourceId}/deployments`),
                    this._cacheService.getArm(
                        `/providers/Microsoft.Web/publishingUsers/web`
                    ),
                    this._authZService.hasPermission(resourceId, [
                        AuthzService.writeScope
                    ]),
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
                this.deploymentObject = null;
                this._aiService.trackEvent('/errors/deployment-center', error);
                this._busyStateScopeManager.clearBusy();
            })
            .retry()
            .subscribe(r => {
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
                this._busyStateScopeManager.clearBusy();
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
                status: 'Completed',
                author: author
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
        if (
            this.SourceLocation !== 'Dropbox' &&
            this.SourceLocation !== 'Onedrive'
        ) {
            return null;
        }
        const folderPath = this.Repo
            .replace('https://www.dropbox.com/home', '')
            .replace(
                'https://api.onedrive.com/v1.0/drive/special/approot:',
                ''
            );
        return folderPath;
    }

    get RollbackEnabled() {
        const rollbackEnabled =
            this.deploymentObject &&
            this.deploymentObject.sourceControls.properties
                .deploymentRollbackEnabled;
        return rollbackEnabled ? 'Yes' : 'No';
    }
    get Repo(): string {
        return (
            this.deploymentObject &&
            this.deploymentObject.sourceControls.properties.repoUrl
        );
    }

    get Branch() {
        return (
            this.deploymentObject &&
            this.deploymentObject.sourceControls.properties.branch
        );
    }

    get ScmType() {
        const isMerc: boolean =
            this.deploymentObject &&
            this.deploymentObject.sourceControls.properties.isMercurial;
        return isMerc ? 'Mercurial' : 'Git';
    }

    get TableItems() {
        return this._tableItems || [];
    }
    get GitCloneUri() {
        const publishingUsername =
            this.deploymentObject &&
            this.deploymentObject.publishingUser.properties.publishingUserName;
        const scmUri =
            this.deploymentObject &&
            this.deploymentObject.publishingCredentials.properties.scmUri.split(
                '@'
            )[1];
        const siteName =
            this.deploymentObject && this.deploymentObject.site.name;
        return (
            this.deploymentObject &&
            `https://${publishingUsername}@${scmUri}:443/${siteName}.git`
        );
    }

    SyncScm() {}

    disconnect() {}
    edit() {}
    refresh() {}

    details(item: KuduTableItem) {
        console.log(item.commit);
    }
    get SourceLocation() {
        const scmType =
            this.deploymentObject &&
            this.deploymentObject.siteConfig.properties.scmType;
        switch (scmType) {
            case 'BitbucketGit':
            case 'BitbucketHg':
                return 'Bitbucket';
            case 'ExternalGit':
                return 'No Clue';
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
