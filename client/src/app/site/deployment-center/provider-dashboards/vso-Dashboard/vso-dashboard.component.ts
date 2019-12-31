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
import { LogCategories, SiteTabIds, ARMApiVersions } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { BusyStateScopeManager } from '../../../../busy-state/busy-state-scope-manager';
import { ArmService } from '../../../../shared/services/arm.service';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../../../shared/models/broadcast-event';
import { dateTimeComparatorReverse } from '../../../../shared/Utilities/comparators';
import { of } from 'rxjs/observable/of';
import { AzureDevOpsService } from '../../deployment-center-setup/wizard-logic/azure-devops.service';
import { DeploymentDashboard } from '../deploymentDashboard';
import { SiteService } from 'app/shared/services/site.service';

class VSODeploymentObject extends DeploymentData {
  VSOData: VSOBuildDefinition;
}

@Component({
  selector: 'app-vso-dashboard',
  templateUrl: './vso-dashboard.component.html',
  styleUrls: ['./vso-dashboard.component.scss'],
  providers: [AzureDevOpsService],
})
export class VsoDashboardComponent extends DeploymentDashboard implements OnChanges, OnDestroy {
  @Input()
  resourceId: string;

  public activeDeployment: KuduLogMessage;
  public hideCreds = false;
  public sidePanelOpened = false;
  public viewInfoStream$: Subject<string>;
  public deploymentObject: VSODeploymentObject;
  public unableToReachVSTS = false;
  private _ngUnsubscribe$ = new Subject();
  private _busyManager: BusyStateScopeManager;
  private _tableItems: ActivityDetailsLog[];
  private readonly _devAzureCom = AzureDevOpsService.AzureDevOpsUrl.Tfs.replace(new RegExp('https://|/', 'gi'), '');

  constructor(
    private _portalService: PortalService,
    private _cacheService: CacheService,
    private _siteService: SiteService,
    private _armService: ArmService,
    private _logService: LogService,
    private _broadcastService: BroadcastService,
    private _azureDevOpsService: AzureDevOpsService,
    translateService: TranslateService
  ) {
    super(translateService);
    this._busyManager = new BusyStateScopeManager(_broadcastService, SiteTabIds.continuousDeployment);
    this.viewInfoStream$ = new Subject<string>();
    this.viewInfoStream$
      .takeUntil(this._ngUnsubscribe$)
      .switchMap(resourceId => {
        return Observable.zip(
          this._siteService.getSite(resourceId),
          this._siteService.fetchSiteConfigMetadata(resourceId, true),
          this._siteService.getSiteDeployments(resourceId),
          (site, metadata, deployments) => ({
            site: site.result,
            metadata: metadata.result,
            deployments: deployments.result,
          })
        );
      })
      .switchMap(r => {
        this.tableMessages.emptyMessage = this._translateService.instant(PortalResources.noDeploymentDataAvailable);

        this.deploymentObject = {
          site: r.site,
          siteMetadata: r.metadata,
          deployments: r.deployments,
          VSOData: null,
        };
        let tableItems = this.deploymentObject.deployments.value.map(element => {
          const tableItem: ActivityDetailsLog = this._populateActivityDetails(element.properties);
          if (tableItem) {
            tableItem.type = 'row';
          }
          return tableItem;
        });
        tableItems = tableItems.filter(element => !!element);
        this._tableItems = tableItems.sort(dateTimeComparatorReverse);
        const vstsMetaData: any = this.deploymentObject.siteMetadata.properties;

        const endpoint = vstsMetaData['VSTSRM_ConfiguredCDEndPoint'];
        const projectId = vstsMetaData['VSTSRM_ProjectId'];
        const buildDefinitionId = vstsMetaData['VSTSRM_BuildDefinitionId'];
        const buildDefinitionUrl: string = vstsMetaData['VSTSRM_BuildDefinitionWebAccessUrl'];

        if (buildDefinitionId) {
          // Get Repository details from build definition

          let accountName = '';
          let buildDefinitionProjectUrl = '';

          if (buildDefinitionUrl) {
            accountName = this.getVSOAccountNameFromUrl(buildDefinitionUrl);
            buildDefinitionProjectUrl = buildDefinitionUrl.substring(0, buildDefinitionUrl.indexOf('/_build?'));
          } else {
            accountName = this.getVSOAccountNameFromUrl(endpoint);
            buildDefinitionProjectUrl = `${AzureDevOpsService.AzureDevOpsUrl.Tfs}${accountName}/${projectId}`;
          }

          return this._azureDevOpsService.getBuildDef(accountName, buildDefinitionProjectUrl, buildDefinitionId).catch((err, caught) => {
            this._busyManager.clearBusy();
            this.deploymentObject = null;
            this._logService.error(LogCategories.cicd, '/load-vso-dashboard', err);
            this.unableToReachVSTS = true;
            return of(null);
          });
        } else {
          this._busyManager.clearBusy();
          return of(null);
        }
      })
      .subscribe(
        r => {
          if (!!r) {
            this._busyManager.clearBusy();
            this.deploymentObject.VSOData = r;
          }
        },
        err => {
          this._busyManager.clearBusy();
          this.deploymentObject = null;
          this._logService.error(LogCategories.cicd, '/load-vso-dashboard', err);
        }
      );
  }

  getVSOAccountNameFromUrl(url: string): string {
    const endpointUri = new URL(url);
    if (endpointUri.host.includes(this._devAzureCom)) {
      return endpointUri.pathname.split('/')[1];
    }
    return endpointUri.hostname.split('.')[0];
  }

  disconnect() {
    const confirmResult = confirm(this._translateService.instant(PortalResources.disconnectConfirm));
    if (confirmResult) {
      let notificationId = null;
      this._busyManager.setBusy();
      this._portalService
        .startNotification(
          this._translateService.instant(PortalResources.disconnectingDeployment),
          this._translateService.instant(PortalResources.disconnectingDeployment)
        )
        .take(1)
        .do(notification => {
          notificationId = notification.id;
        })
        .concatMap(() =>
          this._armService.patch(
            `${this.resourceId}/config/web`,
            { properties: { scmType: 'None' } },
            ARMApiVersions.antaresApiVersion20181101
          )
        )
        .subscribe(
          r => {
            this._busyManager.clearBusy();
            this._portalService.stopNotification(
              notificationId,
              true,
              this._translateService.instant(PortalResources.disconnectingDeploymentSuccess)
            );
            this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter);
          },
          err => {
            this._portalService.stopNotification(
              notificationId,
              false,
              this._translateService.instant(PortalResources.disconnectingDeploymentFail)
            );
            this._logService.error(LogCategories.cicd, '/disconnect-vso-dashboard', err);
          }
        );
    }
  }

  edit() {
    const url = this.deploymentObject.VSOData._links.editor.href;
    const win = window.open(url, '_blank');
    win.focus();
  }

  refresh() {
    this.tableMessages.emptyMessage = this._translateService.instant(PortalResources.fetchingDeploymentData);
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
    const date: moment.Moment = moment(item.end_time);
    const message: string = item.message;

    // populate activity details according to the message format
    let messageToAdd: ActivityDetailsLog = null;
    if (!this._isMessageFormatJSON(message)) {
      messageToAdd = this._createDeploymentLogFromStringMessage(item, date);
    } else {
      const messageJSON: KuduLogMessage = JSON.parse(item.message);
      const logType: VSTSLogMessageType = this._assignLogType(messageJSON.type);

      if (logType !== VSTSLogMessageType.Other) {
        messageToAdd = this._createDeploymentLogFromJSONMessage(item, messageJSON, date, logType);
        if (item.active && item.status === 4) {
          // Set active deployment
          this.activeDeployment = messageJSON;
        }
      }
    }
    return messageToAdd;
  }

  private _createDeploymentLogFromJSONMessage(
    item: any,
    messageJSON: KuduLogMessage,
    date: moment.Moment,
    logType: VSTSLogMessageType
  ): ActivityDetailsLog {
    const t = moment(date);
    return {
      type: 'row',
      id: item.id,
      icon: item.status === 4 ? 'image/success.svg' : 'image/error.svg',

      // grouping is done by date therefore time information is excluded
      date: t.format('YYYY/M/D'),

      time: date.toDate(),
      message: this._getMessage(messageJSON, item.status, logType),
      urlInfo: this._getUrlInfoFromJSONMessage(messageJSON),
    };
  }

  private _getMessage(messageJSON: KuduLogMessage, status: number, logType: VSTSLogMessageType): string {
    const targetApp = messageJSON.prodAppName || messageJSON.slotName;

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
      const repoProvider: string = messageJSON.repoProvider.toLowerCase();
      var repoUrl = messageJSON.repositoryUrl;
      switch (repoProvider) {
        case 'tfsgit':
        case 'git':
          repoUrl = repoUrl || '{0}{1}/_git/{2}'.format(messageJSON.collectionUrl, messageJSON.teamProject, messageJSON.repoName);
          return '{0}/commit/{1}'.format(repoUrl, messageJSON.commitId);
        case 'tfsversioncontrol':
          repoUrl = repoUrl || `{0}{1}`.format(messageJSON.collectionUrl, messageJSON.teamProject);
          return '{0}/_versionControl/changeset/{1}'.format(repoUrl, messageJSON.commitId);
        default:
          return '';
      }
    }
    return '';
  }

  private _getBuildUrl(messageJSON: KuduLogMessage): string {
    if (messageJSON.buildId != null) {
      return messageJSON.buildProjectUrl
        ? '{0}/_build?buildId={1}&_a=summary'.format(messageJSON.buildProjectUrl, messageJSON.buildId)
        : '{0}/{1}/_build?buildId={2}&_a=summary'.format(messageJSON.collectionUrl, messageJSON.teamProject, messageJSON.buildId);
    }
    return '';
  }

  public onUrlClick(url) {
    if (url) {
      const win = window.open(url, '_blank');
      win.focus();
    }
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
      urlInfo.push({
        urlIcon: 'image/deployment-center/CD-Commit.svg',
        urlText: `Source Version ${messageJSON.commitId.substr(0, 10)}`,
        url: commitUrl,
      });
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
  private _createDeploymentLogFromStringMessage(item: any, date: moment.Moment): ActivityDetailsLog {
    const messageString: string = item.message;
    /* messageString is of the format
        "Updating Deployment History For Deployment [collectionUrl][teamProject]/_build?buildId=[buildId]&_a=summary"
            OR
        "Updating Deployment History For Deployment [collectionUrl][teamProject]/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId=[releaseId]&_a=release-summary"
        */

    return {
      id: item.id,
      icon: item.status === 4 ? 'image/success.svg' : 'image/error.svg',
      type: 'row',
      // grouping is done by date therefore time information is excluded
      date: date.format('YY/M/D'),

      time: date.toDate(),
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
          messageString.search('&')
        )}`,
        url: messageString.substr(messageString.search('https')),
      });
    }
    if (messageString.search('releaseId') !== -1) {
      urlInfo.push({
        urlIcon: 'release.svg',
        urlText: `${this._translateService.instant('releaseUrl')} ${messageString.substring(
          messageString.search('=') + 1,
          messageString.search('&')
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
    if (this.deploymentObject && this.deploymentObject.VSOData) {
      const fullUrl = this.deploymentObject.VSOData.url;
      const url = new URL(fullUrl);
      const host = url.host;
      if (host.includes(this._devAzureCom)) {
        const accountName = url.pathname.split('/')[1];
        return accountName;
      }
      return host.replace('https://', '').split('.')[0];
    } else if (this.activeDeployment) {
      return this.getVSOAccountNameFromUrl(this.activeDeployment.collectionUrl);
    }
    return this._translateService.instant(PortalResources.loading);
  }

  accountOnClick() {
    let accountUrl = '';
    if (this.deploymentObject && this.deploymentObject.VSOData) {
      const fullUrl = this.deploymentObject.VSOData.url;
      const url = new URL(fullUrl);
      accountUrl = url.host;
      if (accountUrl.includes(this._devAzureCom)) {
        const accountName = url.pathname.split('/')[1];
        accountUrl = `${accountUrl}/${accountName}`;
      }
      accountUrl = `https://${accountUrl}`;
    } else if (this.activeDeployment) {
      accountUrl = this.activeDeployment.collectionUrl;
    }

    if (accountUrl) {
      const win = window.open(accountUrl, '_blank');
      win.focus();
    }
  }

  get SourceText() {
    let source =
      (this.deploymentObject && this.deploymentObject.VSOData && this.deploymentObject.VSOData.repository.type) ||
      (this.activeDeployment && this.activeDeployment.repoProvider);

    if (source) {
      if (source.toLowerCase() == 'tfsgit' || source.toLowerCase() == 'tfsversioncontrol' || source.toLowerCase() == 'git') {
        return `${this._translateService.instant(PortalResources.azureReposLabel)} (${source})`;
      }
      return source;
    }
    return this._translateService.instant('loading');
  }

  get ProjectName() {
    return (
      (this.deploymentObject && this.deploymentObject.VSOData && this.deploymentObject.VSOData.project.name) ||
      (this.activeDeployment && this.activeDeployment.teamProjectName) ||
      this._translateService.instant('loading')
    );
  }

  get RepositoryText() {
    return (
      (this.deploymentObject && this.deploymentObject.VSOData && this.deploymentObject.VSOData.repository.url) ||
      (this.activeDeployment && this.activeDeployment.repositoryUrl) ||
      this._translateService.instant('loading')
    );
  }

  repositoryOnClick() {
    let repoUrl =
      (this.deploymentObject && this.deploymentObject.VSOData && this.deploymentObject.VSOData.repository.url) ||
      this.activeDeployment.repositoryUrl;
    if (repoUrl) {
      const win = window.open(repoUrl, '_blank');
      win.focus();
    }
  }

  get LoadTestText() {
    if (!this.deploymentObject || !this.deploymentObject.VSOData) {
      return this._translateService.instant('loading');
    }
    const testSiteName = this.deploymentObject.siteMetadata.properties['VSTSRM_TestAppName'];

    return !!testSiteName ? 'Enabled' : 'Disabled';
  }
  get BranchText() {
    return (
      (this.deploymentObject &&
        this.deploymentObject.VSOData &&
        this.deploymentObject.VSOData.repository.defaultBranch.replace('refs/heads/', '')) ||
      (this.activeDeployment && this.activeDeployment.branch) ||
      this._translateService.instant('loading')
    );
  }

  get AppName() {
    if (!this.deploymentObject || !this.deploymentObject.siteMetadata) {
      return this._translateService.instant('loading');
    }
    return this.deploymentObject.siteMetadata.properties['VSTSRM_ProdAppName'];
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
    const failMessage = this._translateService
      .instant(PortalResources.syncRequestSubmittedDescFail)
      .format(this.deploymentObject.site.name);
    this._portalService
      .startNotification(title, description)
      .take(1)
      .concatMap(notificationId => {
        const syncUrl = `${collectionUrl}/${this.deploymentObject.VSOData.project.id}/_apis/build/Builds?api-version=3.1`;
        return this._cacheService
          .post(syncUrl, true, null, {
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

  showDeploymentCredentials() {
    this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter, 'credentials-dashboard');
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  browseToSite() {
    this._browseToSite(this.deploymentObject);
  }
}
