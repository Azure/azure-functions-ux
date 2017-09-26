import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { BusyStateScopeManager } from '../../../../busy-state/busy-state-scope-manager';
import { BusyStateComponent } from '../../../../busy-state/busy-state.component';
import { SiteTabComponent } from '../../../../site/site-dashboard/site-tab/site-tab.component';
import { AuthzService } from '../../../../shared/services/authz.service';
import { AiService } from '../../../../shared/services/ai.service';
import { Observable, Subject } from 'rxjs/Rx';
import { CacheService } from '../../../../shared/services/cache.service';
import { PortalService } from '../../../../shared/services/portal.service';
import { TblComponent } from '../../../../controls/tbl/tbl.component';
import { ActivityDetailsLog, KuduLogMessage, UrlInfo, VSOBuildDefinition } from '../../Models/VSOBuildModels';
import { VSTSLogMessageType } from '../../Models/DeploymentEnums';
import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Deployment, DeploymentData } from '../../Models/deploymentData';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import * as moment from 'moment';

class VSODeploymentObject extends DeploymentData {
    VSOData: VSOBuildDefinition;
}

@Component({
    selector: 'app-vso-dashboard',
    templateUrl: './vso-dashboard.component.html',
    styleUrls: ['./vso-dashboard.component.scss']
})
export class VsoDashboardComponent implements OnChanges {
    @Input() resourceId: string;
    @ViewChild('table') appTable: TblComponent;
    private _tableItems: ActivityDetailsLog[];
    public activeDeployment: ActivityDetailsLog;

    _busyState: BusyStateComponent;
    public viewInfoStream: Subject<string>;
    _viewInfoSubscription: RxSubscription;
    _busyStateScopeManager: BusyStateScopeManager;
    _writePermission = true;
    _readOnlyLock = false;
    public hasWritePermissions = true;
    public deploymentObject: VSODeploymentObject;

    constructor(
        private _portalService: PortalService,
        private _cacheService: CacheService,
        private _aiService: AiService,
        private _authZService: AuthzService,
        siteTabsComponent: SiteTabComponent,
        private _translateService: TranslateService
    ) {
        this._busyState = siteTabsComponent.busyState;
        this._busyStateScopeManager = this._busyState.getScopeManager();

        this.viewInfoStream = new Subject<string>();
        this._viewInfoSubscription = this.viewInfoStream
            .distinctUntilChanged()
            .switchMap(resourceId => {
                this._busyStateScopeManager.setBusy();
                return Observable.zip(
                    this._cacheService.getArm(resourceId),
                    this._cacheService.getArm(`${resourceId}/config/web`),
                    this._cacheService.postArm(`${resourceId}/config/metadata/list`),
                    this._cacheService.postArm(`${resourceId}/config/publishingcredentials/list`),
                    this._cacheService.getArm(`${resourceId}/sourcecontrols/web`),
                    this._cacheService.getArm(`${resourceId}/deployments`),
                    this._authZService.hasPermission(resourceId, [AuthzService.writeScope]),
                    this._authZService.hasReadOnlyLock(resourceId),
                    (site, siteConfig, metadata, pubCreds, sourceControl, deployments, writePerm: boolean, readLock: boolean) => ({
                        site: site.json(),
                        siteConfig: siteConfig.json(),
                        metadata: metadata.json(),
                        pubCreds: pubCreds.json(),
                        sourceControl: sourceControl.json(),
                        deployments: deployments.json(),
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
            .switchMap(r => {
                this.deploymentObject = {
                    site: r.site,
                    siteConfig: r.siteConfig,
                    siteMetadata: r.metadata,
                    sourceControls: r.sourceControl,
                    publishingCredentials: r.pubCreds,
                    deployments: r.deployments,
                    publishingUser: null,
                    VSOData: null
                };
                this._tableItems = [];
                this.deploymentObject.deployments.value.forEach(element => {
                    const tableItem: ActivityDetailsLog = this._populateActivityDetails(element.properties);
                    tableItem.type = 'row';
                    this._tableItems.push(tableItem);
                });
                setTimeout(() => {
                    this.appTable.groupItems('date', 'desc');
                }, 0);
                this._writePermission = r.writePermission;
                this._readOnlyLock = r.readOnlyLock;
                this.hasWritePermissions = r.writePermission && !r.readOnlyLock;
                this._busyStateScopeManager.clearBusy();

                const vstsMetaData: any = this.deploymentObject.siteMetadata.properties;

                const endpoint = vstsMetaData['VSTSRM_ConfiguredCDEndPoint'];
                const endpointUri = new URL(endpoint);
                const projectId = vstsMetaData['VSTSRM_ProjectId'];
                const buildId = vstsMetaData['VSTSRM_BuildDefinitionId'];

                return this._cacheService.get(
                    `https://${endpointUri.host}/DefaultCollection/${projectId}/_apis/build/Definitions/${buildId}?api-version=2.0`
                );
            })
            .subscribe(r => {
                this.deploymentObject.VSOData = r.json();
            });
    }

    SyncScm() {}

    disconnect() {}
    edit() {}
    refresh() {}
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['resourceId']) {
            this.viewInfoStream.next(this.resourceId);
        }
    }

    private _assignLogType(logType: string): VSTSLogMessageType {
        logType = logType.toLowerCase();
        switch (logType) {
            case 'deployment':
                return VSTSLogMessageType.Deployment;
            case 'slotswap':
                return VSTSLogMessageType.SlotSwap;
            case 'cddeploymentconfiguration':
                return VSTSLogMessageType.CDDeploymentConfiguration;
            case 'localgitcdconfiguration':
                return VSTSLogMessageType.LocalGitCdConfiguration;
            case 'cdslotcreation':
                return VSTSLogMessageType.CDSlotCreation;
            case 'cdaccountcreated':
                return VSTSLogMessageType.CDAccountCreated;
            case 'cdtestwebappcreation':
                return VSTSLogMessageType.CDTestWebAppCreation;
            case 'cddisconnect':
                return VSTSLogMessageType.CDDisconnect;
            case 'sync':
                return VSTSLogMessageType.Sync;
            case 'start azure app service':
                return VSTSLogMessageType.StartAzureAppService;
            case 'stop azure app service':
                return VSTSLogMessageType.StopAzureAppService;
            case 'restart azure app service':
                return VSTSLogMessageType.RestartAzureAppService;
            default:
                return VSTSLogMessageType.Other;
        }
    }

    private _populateActivityDetails(item: Deployment) {
        const date: Date = new Date(item.end_time);
        const message: string = item.message;

        // populate activity details according to the message format
        let messageToAdd: ActivityDetailsLog;
        if (!this._isMessageFormatJSON(message)) {
            messageToAdd = this._createDeploymentLogFromStringMessage(item, date);
        } else {
            let destinationSlotName = '';
            const messageJSON: KuduLogMessage = JSON.parse(item.message);
            const logType: VSTSLogMessageType = this._assignLogType(messageJSON.type);

            if (logType === VSTSLogMessageType.CDDisconnect) {
                destinationSlotName = messageJSON.prodAppName;
            } else {
                destinationSlotName = messageJSON.slotName;
            }
            if (logType !== VSTSLogMessageType.Other) {
                messageToAdd = this._createDeploymentLogFromJSONMessage(item, messageJSON, date, logType, destinationSlotName);
            }
        }
        return messageToAdd;
    }

    private _createDeploymentLogFromJSONMessage(
        item: any,
        messageJSON: KuduLogMessage,
        date: Date,
        logType: VSTSLogMessageType,
        targetApp?: string
    ): ActivityDetailsLog {
        const t = moment(date);
        return {
            type: 'row',
            id: item.id,
            icon: item.status === 4 ? 'image/success.svg' : 'image/error.svg',

            // grouping is done by date therefore time information is excluded
            date: t.format('M/D/YY'),

            time: t.format('h:mm:ss A'),
            message: this._getMessage(messageJSON, item.status, logType, targetApp),
            urlInfo: this._getUrlInfoFromJSONMessage(messageJSON)
        };
    }

    private _getMessage(messageJSON: KuduLogMessage, status: number, logType: VSTSLogMessageType, targetApp?: string): string {
        //TODO: Move strings to localization
        targetApp = targetApp ? targetApp : messageJSON.slotName;
        switch (logType) {
            case VSTSLogMessageType.Deployment:
                return status === 4
                    ? '{0} to {1}'.format('Deployed Successfully to', targetApp)
                    : '{0} to {1}'.format('Failed to deploy to', targetApp);
            case VSTSLogMessageType.SlotSwap:
                return status === 4
                    ? '{0} {1} with {2}'.format('Swapped slot', messageJSON.sourceSlot, messageJSON.targetSlot)
                    : '{0} {1} with {2}'.format('Failed to swap slot', messageJSON.sourceSlot, messageJSON.targetSlot);
            case VSTSLogMessageType.CDDeploymentConfiguration:
                return status === 4 ? 'Successfully setup Continuous Delivery and triggered build' : 'Failed to setup Continuous Delivery';
            case VSTSLogMessageType.LocalGitCdConfiguration:
                return 'Successfully setup Continuous Delivery for the repository';
            case VSTSLogMessageType.CDAccountCreated:
                return status === 4
                    ? 'Created new Visual Studio Team Services account'
                    : 'Failed to create Visual Studio Team Services account';
            case VSTSLogMessageType.CDSlotCreation:
                return status === 4 ? 'Created new slot' : 'Failed to create a slot';
            case VSTSLogMessageType.CDTestWebAppCreation:
                return status === 4
                    ? 'Created new Web Application for test environment'
                    : 'Failed to create new Web Application for test environment';
            case VSTSLogMessageType.CDDisconnect:
                return 'Successfully disconnected Continuous Delivery for {0}'.format(targetApp);
            case VSTSLogMessageType.StartAzureAppService:
                return status === 4 ? '{0} got started'.format(targetApp) : 'Failed to start {0}'.format(targetApp);
            case VSTSLogMessageType.StopAzureAppService:
                return status === 4 ? '{0} got stopped'.format(targetApp) : 'Failed to stop {0}'.format(targetApp);
            case VSTSLogMessageType.RestartAzureAppService:
                return status === 4 ? '{0} got restarted'.format(targetApp) : 'Failed to restart {0}'.format(targetApp);
            case VSTSLogMessageType.Sync:
                return 'Successfully triggered Continuous Delivery with latest source code from repository';
            default:
                return '';
        }
    }

    private _getCommitUrl(messageJSON: KuduLogMessage): string {
        if (messageJSON.commitId != null) {
            const repoName: string = messageJSON.repoProvider.toLowerCase();
            switch (repoName) {
                case 'tfsgit':
                    return '{0}{1}/_git/{2}/commit/{3}'.format(
                        messageJSON.collectionUrl,
                        messageJSON.teamProject,
                        messageJSON.repoName,
                        messageJSON.commitId
                    );
                case 'tfsversioncontrol':
                    return '{0}{1}/_versionControl/changeset/{2}'.format(
                        messageJSON.collectionUrl,
                        messageJSON.teamProject,
                        messageJSON.commitId
                    );
                default:
                    return '';
            }
        }
        return '';
    }

    private _getBuildUrl(messageJSON: KuduLogMessage): string {
        if (messageJSON.buildId != null) {
            return '{0}{1}/_build?buildId={2}&_a=summary'.format(messageJSON.collectionUrl, messageJSON.teamProject, messageJSON.buildId);
        }
        return '';
    }

    public onUrlClick(url) {
        const win = window.open(url, '_blank');
        win.focus();
    }

    private _getReleaseUrl(messageJSON: KuduLogMessage): string {
        if (messageJSON.releaseId != null) {
            return '{0}{1}/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId={2}&_a=release-summary'.format(
                messageJSON.collectionUrl,
                messageJSON.teamProject,
                messageJSON.releaseId
            );
        }
        return '';
    }

    private _getUrlInfoFromJSONMessage(messageJSON: KuduLogMessage): UrlInfo[] {
        const urlInfo: UrlInfo[] = [];
        if (messageJSON.commitId) {
            const commitUrl: string = this._getCommitUrl(messageJSON);
            if (commitUrl) {
                urlInfo.push({
                    urlIcon: 'image/deployment-center/CD-Commit.svg',
                    urlText: `Source Version ${messageJSON.commitId.substr(0, 10)}`,
                    url: commitUrl
                });
            }
        }
        if (messageJSON.buildNumber) {
            const buildUrl: string = this._getBuildUrl(messageJSON);
            if (buildUrl) {
                urlInfo.push({
                    urlIcon: 'image/deployment-center/CD-Build.svg',
                    urlText: `Build ${messageJSON.buildNumber}`,
                    url: buildUrl
                });
            }
        }
        if (messageJSON.releaseId) {
            const releaseUrl: string = this._getReleaseUrl(messageJSON);
            if (releaseUrl) {
                urlInfo.push({
                    urlIcon: 'image/deployment-center/CD-Release.svg',
                    urlText: `Release: ${messageJSON.releaseId}`,
                    url: releaseUrl
                });
            }
        }
        if (messageJSON.VSTSRM_BuildDefinitionWebAccessUrl) {
            urlInfo.push({
                urlText: 'Build Definition',
                url: messageJSON.VSTSRM_BuildDefinitionWebAccessUrl
            });
        }
        if (messageJSON.VSTSRM_ConfiguredCDEndPoint) {
            urlInfo.push({
                urlText: 'Release Definition',
                url: messageJSON.VSTSRM_ConfiguredCDEndPoint
            });
        }
        if (messageJSON.VSTSRM_BuildWebAccessUrl) {
            urlInfo.push({
                urlText: 'Build triggered',
                url: messageJSON.VSTSRM_BuildWebAccessUrl
            });
        }
        if (messageJSON.AppUrl) {
            urlInfo.push({
                urlText: 'Web App',
                url: messageJSON.AppUrl
            });
        }
        if (messageJSON.SlotUrl) {
            urlInfo.push({
                urlText: 'Slot',
                url: messageJSON.SlotUrl
            });
        }
        if (messageJSON.VSTSRM_AccountUrl) {
            urlInfo.push({
                urlText: 'VSTS Account',
                url: messageJSON.VSTSRM_AccountUrl
            });
        }
        if (messageJSON.VSTSRM_RepoUrl) {
            urlInfo.push({
                urlText: 'View Instructions',
                url: messageJSON.VSTSRM_RepoUrl
            });
        }
        return urlInfo;
    }
    private _createDeploymentLogFromStringMessage(item: any, date: Date): ActivityDetailsLog {
        const messageString: string = item.message;
        /* messageString is of the format
        "Updating Deployment History For Deployment [collectionUrl][teamProject]/_build?buildId=[buildId]&_a=summary"
            OR
        "Updating Deployment History For Deployment [collectionUrl][teamProject]/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId=[releaseId]&_a=release-summary"
    */
        const t = moment(date);
        return {
            id: item.id,
            icon: item.status === 4 ? 'image/success.svg' : 'image/error.svg',
            type: 'row',
            // grouping is done by date therefore time information is excluded
            date: t.format('M/D/YY'),

            time: t.format('h:mm:ss A'),
            message: item.status === 4 ? 'Deployed successfully' : 'Failed to deploy',

            urlInfo: this._getUrlInfoFromStringMessage(messageString)
        };
    }

    private _getUrlInfoFromStringMessage(messageString: string): UrlInfo[] {
        const urlInfo: UrlInfo[] = [];
        if (messageString.search('buildId') !== -1) {
            urlInfo.push({
                urlIcon: 'build.svg',
                urlText: `Build: ${messageString.substring(messageString.search('=') + 1, messageString.search('&'))}`,
                url: messageString.substr(messageString.search('https'))
            });
        }
        if (messageString.search('releaseId') !== -1) {
            urlInfo.push({
                urlIcon: 'release.svg',
                urlText: `Release: ${messageString.substring(messageString.search('=') + 1, messageString.search('&'))}`,
                url: messageString.substr(messageString.search('https'))
            });
        }
        return urlInfo;
    }

    private _isMessageFormatJSON(message: any): boolean {
        try {
            JSON.parse(message);
        } catch (exception) {
            return false;
        }
        return true;
    }

    get TableItems() {
        return this._tableItems || [];
    }

    get AccountText() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return this._translateService.instant(PortalResources.loading);
        }
        const url = new URL(this.deploymentObject.VSOData.url).host;
        return url;
    }

    accountOnClick() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return;
        }
        const url = new URL(this.deploymentObject.VSOData.url).host;
        const win = window.open(`https://${url}`, '_blank');
        win.focus();
    }

    get SourceText() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return 'Loading..';
        }
        return this.deploymentObject.VSOData.repository.type;
    }

    get ProjectName() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return 'Loading..';
        }
        return this.deploymentObject.VSOData.project.name;
    }

    get RepositoryText() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return 'Loading..';
        }
        return this.deploymentObject.VSOData.repository.url;
    }

    repositoryOnClick() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return;
        }
        const win = window.open(this.deploymentObject.VSOData.repository.url, '_blank');
        win.focus();
    }

    get LoadTestText() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return 'Loading..';
        }
        const testSiteName = this.deploymentObject.siteMetadata.properties['VSTSRM_TestAppName'];

        return !!testSiteName ? 'Enabled' : 'Disabled';
    }
    get BranchText() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return 'Loading..';
        }
        return this.deploymentObject.VSOData.repository.defaultBranch.replace('refs/heads/', '');
    }

    get SlotName() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return 'Loading..';
        }
        const slotName = this.deploymentObject.siteMetadata.properties['VSTSRM_SlotName'];
        return !!slotName ? slotName : null;
    }

    slotOnClick() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return;
        }
        const slotName = this.deploymentObject.siteMetadata.properties['VSTSRM_SlotName'];
        this._portalService.openBlade(
            {
                detailBlade: 'AppsOverviewBlade',
                detailBladeInputs: {
                    id: `${this.deploymentObject.site.id}/slots/${slotName}`
                }
            },
            'deployment-center'
        );
    }
}
