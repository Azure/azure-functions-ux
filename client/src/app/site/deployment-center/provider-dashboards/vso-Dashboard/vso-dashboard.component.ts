import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { Observable, Subject } from 'rxjs/Rx';
import { CacheService } from '../../../../shared/services/cache.service';
import { PortalService } from '../../../../shared/services/portal.service';
import { ActivityDetailsLog, KuduLogMessage, UrlInfo, VSOBuildDefinition } from '../../Models/vso-build-models';
import { VSTSLogMessageType } from '../../Models/deployment-enums';
import { SimpleChanges, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Deployment, DeploymentData } from '../../Models/deployment-data';
import { Component, Input, OnChanges } from '@angular/core';
import * as moment from 'moment-mini-ts';
import { LogCategories, SiteTabIds } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { BusyStateScopeManager } from '../../../../busy-state/busy-state-scope-manager';
import { ArmService } from '../../../../shared/services/arm.service';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../../../shared/models/broadcast-event';

class VSODeploymentObject extends DeploymentData {
    VSOData: VSOBuildDefinition;
}

@Component({
    selector: 'app-vso-dashboard',
    templateUrl: './vso-dashboard.component.html',
    styleUrls: ['./vso-dashboard.component.scss'],
})
export class VsoDashboardComponent implements OnChanges, OnDestroy {
    @Input() resourceId: string;
    private _tableItems: ActivityDetailsLog[];
    public activeDeployment: ActivityDetailsLog;

    public viewInfoStream$: Subject<string>;
    public deploymentObject: VSODeploymentObject;
    private _ngUnsubscribe$ = new Subject();
    private _busyManager: BusyStateScopeManager;
    private readonly _devAzureCom = 'dev.azure.com';
    constructor(
        private _portalService: PortalService,
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _logService: LogService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
    ) {
        this._busyManager = new BusyStateScopeManager(_broadcastService, SiteTabIds.continuousDeployment);
        this.viewInfoStream$ = new Subject<string>();
        this.viewInfoStream$
            .takeUntil(this._ngUnsubscribe$)
            .switchMap(resourceId => {
                return Observable.zip(
                    this._cacheService.getArm(resourceId),
                    this._cacheService.postArm(`${resourceId}/config/metadata/list`, true),
                    this._cacheService.getArm(`${resourceId}/deployments`, true),
                    (site, metadata, deployments) => ({
                        site: site.json(),
                        metadata: metadata.json(),
                        deployments: deployments.json(),
                    }),
                );
            })
            .switchMap(r => {
                this.deploymentObject = {
                    site: r.site,
                    siteMetadata: r.metadata,
                    deployments: r.deployments,
                    VSOData: null,
                };
                this._tableItems = [];
                this.deploymentObject.deployments.value.forEach(element => {
                    const tableItem: ActivityDetailsLog = this._populateActivityDetails(element.properties);
                    tableItem.type = 'row';
                    this._tableItems.push(tableItem);
                });

                const vstsMetaData: any = this.deploymentObject.siteMetadata.properties;

                const endpoint = vstsMetaData['VSTSRM_ConfiguredCDEndPoint'];
                const endpointUri = new URL(endpoint);
                const projectId = vstsMetaData['VSTSRM_ProjectId'];
                const buildId = vstsMetaData['VSTSRM_BuildDefinitionId'];

                let buildDefUrl = `https://${endpointUri.host}/${projectId}/_apis/build/Definitions/${buildId}?api-version=2.0`;
                if (endpointUri.host.includes(this._devAzureCom)) {
                    const accountName = endpointUri.pathname.split('/')[1];
                    buildDefUrl = `https://${endpointUri.host}/${accountName}/${projectId}/_apis/build/Definitions/${buildId}?api-version=2.0`;
                }
                return this._cacheService.get(buildDefUrl);
            })
            .subscribe(
                r => {
                    this._busyManager.clearBusy();
                    this.deploymentObject.VSOData = r.json();
                },
                err => {
                    this._busyManager.clearBusy();
                    this.deploymentObject = null;
                    this._logService.error(LogCategories.cicd, '/load-vso-dashboard', err);
                },
            );
    }

    disconnect() {
        const confirmResult = confirm(this._translateService.instant(PortalResources.disconnectConfirm));
        if (confirmResult) {
            let notificationId = null;
            this._busyManager.setBusy();
            this._portalService
                .startNotification(this._translateService.instant(PortalResources.disconnectingDeployment), this._translateService.instant(PortalResources.disconnectingDeployment))
                .do(notification => {
                    notificationId = notification.id;
                })
                .concatMap(() => this._armService.patch(`${this.deploymentObject.site.id}/config/web`, { properties: { scmType: 'None' } }))
                .subscribe(r => {
                    this._busyManager.clearBusy();
                    this._portalService.stopNotification(notificationId, true, this._translateService.instant(PortalResources.disconnectingDeploymentSuccess));
                    this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter);
                },
                    err => {
                        this._portalService.stopNotification(notificationId, false, this._translateService.instant(PortalResources.disconnectingDeploymentFail));
                        this._logService.error(LogCategories.cicd, '/disconnect-vso-dashboard', err);
                    });
        }
    }

    edit() {
        const url = this.deploymentObject.VSOData._links.editor.href;
        const win = window.open(url, '_blank');
        win.focus();
    }

    refresh() {
        this._busyManager.setBusy();
        this.viewInfoStream$.next(this.resourceId);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['resourceId']) {
            this.viewInfoStream$.next(this.resourceId);
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
        targetApp?: string,
    ): ActivityDetailsLog {
        const t = moment(date);
        return {
            type: 'row',
            id: item.id,
            icon: item.status === 4 ? 'image/success.svg' : 'image/error.svg',

            // grouping is done by date therefore time information is excluded
            date: t.format('YYYY/M/D'),

            time: date,
            message: this._getMessage(messageJSON, item.status, logType, targetApp),
            urlInfo: this._getUrlInfoFromJSONMessage(messageJSON),
        };
    }

    private _getMessage(messageJSON: KuduLogMessage, status: number, logType: VSTSLogMessageType, targetApp?: string): string {
        targetApp = targetApp ? targetApp : messageJSON.slotName;
        switch (logType) {
            case VSTSLogMessageType.Deployment:
                return status === 4
                    ? this._translateService.instant('deployedSuccessfullyTo').format(targetApp)
                    : this._translateService.instant('deployedFailedTo').format(targetApp);
            case VSTSLogMessageType.SlotSwap:
                return status === 4
                    ? this._translateService.instant('swappedSlotSuccess').format(messageJSON.sourceSlot, messageJSON.targetSlot)
                    : this._translateService.instant('swappedSlotFail').format(messageJSON.sourceSlot, messageJSON.targetSlot);
            case VSTSLogMessageType.CDDeploymentConfiguration:
                return status === 4
                    ? this._translateService.instant('setupCDSuccessAndTriggerBuild')
                    : this._translateService.instant('setupCDFail');
            case VSTSLogMessageType.LocalGitCdConfiguration:
                return this._translateService.instant('setupCDSuccess');
            case VSTSLogMessageType.CDAccountCreated:
                return status === 4
                    ? this._translateService.instant('createVSTSAccountSuccess')
                    : this._translateService.instant('createVSTSAccountFail');
            case VSTSLogMessageType.CDSlotCreation:
                return status === 4
                    ? this._translateService.instant('createdNewSlotSuccess')
                    : this._translateService.instant('createdNewSlotFail');
            case VSTSLogMessageType.CDTestWebAppCreation:
                return status === 4
                    ? this._translateService.instant('createTestWebAppSuccess')
                    : this._translateService.instant('createTestWebAppFail');
            case VSTSLogMessageType.CDDisconnect:
                return this._translateService.instant('disconnectCICDVSOSuccess').format(targetApp);
            case VSTSLogMessageType.StartAzureAppService:
                return status === 4
                    ? this._translateService.instant('appServiceStartSuccess').format(targetApp)
                    : this._translateService.instant('appServiceStartFail').format(targetApp);
            case VSTSLogMessageType.StopAzureAppService:
                return status === 4
                    ? this._translateService.instant('appServiceStopSuccess').format(targetApp)
                    : this._translateService.instant('appServiceStopFail').format(targetApp);
            case VSTSLogMessageType.RestartAzureAppService:
                return status === 4
                    ? this._translateService.instant('appServiceRestartSuccess').format(targetApp)
                    : this._translateService.instant('appServiceRestartFail').format(targetApp);
            case VSTSLogMessageType.Sync:
                return this._translateService.instant('vsoSync');
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
                        messageJSON.commitId,
                    );
                case 'tfsversioncontrol':
                    return '{0}{1}/_versionControl/changeset/{2}'.format(
                        messageJSON.collectionUrl,
                        messageJSON.teamProject,
                        messageJSON.commitId,
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
                messageJSON.releaseId,
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
                    url: commitUrl,
                });
            }
        }
        if (messageJSON.buildNumber) {
            const buildUrl: string = this._getBuildUrl(messageJSON);
            if (buildUrl) {
                urlInfo.push({
                    urlIcon: 'image/deployment-center/CD-Build.svg',
                    urlText: `Build ${messageJSON.buildNumber}`,
                    url: buildUrl,
                });
            }
        }
        if (messageJSON.releaseId) {
            const releaseUrl: string = this._getReleaseUrl(messageJSON);
            if (releaseUrl) {
                urlInfo.push({
                    urlIcon: 'image/deployment-center/CD-Release.svg',
                    urlText: `Release: ${messageJSON.releaseId}`,
                    url: releaseUrl,
                });
            }
        }
        if (messageJSON.VSTSRM_BuildDefinitionWebAccessUrl) {
            urlInfo.push({
                urlText: this._translateService.instant('buildDefinition'),
                url: messageJSON.VSTSRM_BuildDefinitionWebAccessUrl,
            });
        }
        if (messageJSON.VSTSRM_ConfiguredCDEndPoint) {
            urlInfo.push({
                urlText: this._translateService.instant('releaseDefinition'),
                url: messageJSON.VSTSRM_ConfiguredCDEndPoint,
            });
        }
        if (messageJSON.VSTSRM_BuildWebAccessUrl) {
            urlInfo.push({
                urlText: this._translateService.instant('buildTriggered'),
                url: messageJSON.VSTSRM_BuildWebAccessUrl,
            });
        }
        if (messageJSON.AppUrl) {
            urlInfo.push({
                urlText: this._translateService.instant('webApp'),
                url: messageJSON.AppUrl,
            });
        }
        if (messageJSON.SlotUrl) {
            urlInfo.push({
                urlText: this._translateService.instant('slot'),
                url: messageJSON.SlotUrl,
            });
        }
        if (messageJSON.VSTSRM_AccountUrl) {
            urlInfo.push({
                urlText: this._translateService.instant('vsoAccount'),
                url: messageJSON.VSTSRM_AccountUrl,
            });
        }
        if (messageJSON.VSTSRM_RepoUrl) {
            urlInfo.push({
                urlText: this._translateService.instant('viewInstructions'),
                url: messageJSON.VSTSRM_RepoUrl,
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
            date: t.format('YY/M/D'),

            time: date,
            message: item.status === 4 ? 'Deployed successfully' : 'Failed to deploy',

            urlInfo: this._getUrlInfoFromStringMessage(messageString),
        };
    }

    private _getUrlInfoFromStringMessage(messageString: string): UrlInfo[] {
        const urlInfo: UrlInfo[] = [];
        if (messageString.search('buildId') !== -1) {
            urlInfo.push({
                urlIcon: 'build.svg',
                urlText: `${this._translateService.instant('buildUrl')} ${messageString.substring(
                    messageString.search('=') + 1,
                    messageString.search('&'),
                )}`,
                url: messageString.substr(messageString.search('https')),
            });
        }
        if (messageString.search('releaseId') !== -1) {
            urlInfo.push({
                urlIcon: 'release.svg',
                urlText: `${this._translateService.instant('releaseUrl')} ${messageString.substring(
                    messageString.search('=') + 1,
                    messageString.search('&'),
                )}`,
                url: messageString.substr(messageString.search('https')),
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
        const fullUrl = this.deploymentObject.VSOData.url;
        const url = new URL(fullUrl);
        const host = url.host;
        if (host.includes(this._devAzureCom)) {
            const accountName = url.pathname.split('/')[1];
            return accountName;
        }
        return host.replace('https://', '').split('.')[0];
    }

    accountOnClick() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return;
        }

        const fullUrl = this.deploymentObject.VSOData.url;
        const url = new URL(fullUrl);
        let gotoUrl = url.host;
        if (gotoUrl.includes(this._devAzureCom)) {
            const accountName = url.pathname.split('/')[1];
            gotoUrl = `${gotoUrl}/${accountName}`;
        }
        const win = window.open(`https://${gotoUrl}`, '_blank');
        win.focus();
    }

    get SourceText() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return this._translateService.instant('loading');
        }
        return this.deploymentObject.VSOData.repository.type;
    }

    get ProjectName() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return this._translateService.instant('loading');
        }
        return this.deploymentObject.VSOData.project.name;
    }

    get RepositoryText() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return this._translateService.instant('loading');
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
            return this._translateService.instant('loading');
        }
        const testSiteName = this.deploymentObject.siteMetadata.properties['VSTSRM_TestAppName'];

        return !!testSiteName ? 'Enabled' : 'Disabled';
    }
    get BranchText() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return this._translateService.instant('loading');
        }
        return this.deploymentObject.VSOData.repository.defaultBranch.replace('refs/heads/', '');
    }

    get SlotName() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return this._translateService.instant('loading');
        }
        const slotName = this.deploymentObject.siteMetadata.properties['VSTSRM_SlotName'];
        return !!slotName ? slotName : null;
    }

    syncScm() {
        const fullUrl = this.deploymentObject.VSOData.url;
        const url = new URL(fullUrl);
        let collectionUrl = `https://${url.host}`;
        let accountName = '';
        if (collectionUrl.includes(this._devAzureCom)) {
            accountName = url.pathname.split('/')[1];
            collectionUrl = `${collectionUrl}/${accountName}`;
        } else {
            accountName = url.pathname.split('/')[0].split('.')[0];
        }

        this._busyManager.setBusy();
        const title = this._translateService.instant(PortalResources.syncRequestSubmitted);
        const description = this._translateService.instant(PortalResources.syncRequestSubmittedDesc).format(this.deploymentObject.site.name);
        const failMessage = this._translateService.instant(PortalResources.syncRequestSubmittedDescFail).format(this.deploymentObject.site.name);
        this._portalService.startNotification(title, description).concatMap(notificationId => {
            const syncUrl = `${collectionUrl}/${this.deploymentObject.VSOData.project.id}/_apis/build/Builds?api-version=3.1`;
            return this._cacheService.post(syncUrl, true, null, {
                definition: {
                    id: `${this.deploymentObject.VSOData.id}`,
                },
                sourceBranch: this.deploymentObject.VSOData.repository.defaultBranch,
            })
                .concatMap(() => {
                    const deploymentId = Date.now().toString();
                    const logData = {
                        id: deploymentId,
                        properties: {
                            id: deploymentId,
                            status: 4,
                            active: false,
                            author: 'VSTSRM',
                            deployer: 'VSTSRM',
                            message: JSON.stringify({
                                type: 'Sync',
                                prodAppName: this.deploymentObject.site.name,
                                buildId: `${this.deploymentObject.VSOData.id}`,
                                collectionUrl: collectionUrl,
                                teamProject: this.deploymentObject.VSOData.project.id,
                                message: '',
                            }),
                        },
                    };
                    return this._cacheService.putArm(`${this.deploymentObject.site.id}/deployments/${deploymentId}`, null, logData);
                })
                .map(() => {
                    this.refresh();
                    this._portalService.stopNotification(notificationId.id, true, description);
                    return Observable.of(true);
                })
                .catch(() => {
                    this._busyManager.clearBusy();
                    this._portalService.stopNotification(notificationId.id, false, failMessage);
                    return Observable.of(false);
                });
        })
            .subscribe();
    }

    slotOnClick() {
        if (!this.deploymentObject || !this.deploymentObject.VSOData) {
            return;
        }
        const slotName = this.deploymentObject.siteMetadata.properties['VSTSRM_SlotName'];
        this._portalService.openBladeDeprecated(
            {
                detailBlade: 'AppsOverviewBlade',
                detailBladeInputs: {
                    id: `${this.deploymentObject.site.id}/slots/${slotName}`,
                },
            },
            'deployment-center',
        );
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe$.next();
    }
}
