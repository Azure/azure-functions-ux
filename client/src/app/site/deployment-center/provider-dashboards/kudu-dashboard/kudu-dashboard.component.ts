import { ArmService } from '../../../../shared/services/arm.service';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { TableItem, GetTableHash } from '../../../../controls/tbl/tbl.component';
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
import { LogCategories, SiteTabIds, KeyCodes, ARMApiVersions } from 'app/shared/models/constants';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { dateTimeComparatorReverse } from '../../../../shared/Utilities/comparators';
import { of } from 'rxjs/observable/of';
import { DeploymentDashboard } from '../deploymentDashboard';
import { SiteService } from 'app/shared/services/site.service';

enum DeployStatus {
  Pending,
  Building,
  Deploying,
  Failed,
  Success,
}

class KuduTableItem implements TableItem {
  public type: 'row' | 'group';
  public time: Date;
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
export class KuduDashboardComponent extends DeploymentDashboard implements OnChanges, OnDestroy {
  @Input()
  resourceId: string;
  @ViewChild('myTable')
  table: any;

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

  // Regex: A set of :<characters between>@ but dont use : where / is directly after
  private readonly repoUrlPasswordRegex = /:[^\/]+@/g;
  constructor(
    private _portalService: PortalService,
    private _cacheService: CacheService,
    private _siteService: SiteService,
    private _armService: ArmService,
    private _broadcastService: BroadcastService,
    private _logService: LogService,
    translateService: TranslateService
  ) {
    super(translateService);
    this._busyManager = new BusyStateScopeManager(_broadcastService, SiteTabIds.continuousDeployment);
    this._tableItems = [];
    this.viewInfoStream$ = new Subject<string>();
    this.viewInfoStream$
      .takeUntil(this._ngUnsubscribe$)
      .switchMap(resourceId => {
        return Observable.zip(
          this._siteService.getSite(resourceId, this._forceLoad),
          this._siteService.getSiteConfig(resourceId, this._forceLoad),
          this._siteService.getPublishingCredentials(resourceId, this._forceLoad),
          this._siteService.getSiteSourceControlConfig(resourceId, this._forceLoad),
          this._siteService.getSiteDeployments(resourceId),
          this._siteService.getPublishingUser(),
          (site, siteConfig, pubCreds, sourceControl, deployments, publishingUser) => ({
            site: site.result,
            siteConfig: siteConfig.result,
            pubCreds: pubCreds.result,
            sourceControl: sourceControl.result,
            deployments: deployments.result,
            publishingUser: publishingUser.result,
          })
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
        }
      );

    // refresh automatically every 5 seconds
    Observable.timer(5000, 5000)
      .takeUntil(this._ngUnsubscribe$)
      .subscribe(() => {
        this._deploymentFetchTries++;
        this.viewInfoStream$.next(this.resourceId);
      });
  }

  onLogsKeyUp(event: KeyboardEvent, row: any) {
    if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
      this.details(row);
    }
  }
  private _redeployEnabled() {
    const scmProvider = this.deploymentObject.siteConfig.properties.scmType;
    if (scmProvider === 'Dropbox' || scmProvider === 'OneDrive') {
      return this.deploymentObject.sourceControls.properties.deploymentRollbackEnabled;
    }
    return true;
  }

  private _populateTable() {
    const deployments = this.deploymentObject.deployments.value;
    const tableItems = deployments.map(value => {
      const item = value.properties;
      const date: moment.Moment = moment(item.received_time);
      const t = moment(date);

      const commitId = item.id.substr(0, 7);
      const author = item.author;
      const row: KuduTableItem = {
        type: 'row',
        time: date.toDate(),
        date: t.format('M/D/YY'),
        commit: commitId,
        checkinMessage: item.message,
        status: this._getStatusString(item.status, item.progress),
        active: item.active,
        author: author,
        deploymentObj: value,
      };
      return row;
    });

    const newHash = GetTableHash(tableItems);
    if (this._oldTableHash !== newHash) {
      this._tableItems = tableItems.sort(dateTimeComparatorReverse);
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
    let repoUrl = this.deploymentObject && this.deploymentObject.sourceControls.properties.repoUrl;
    if (repoUrl) {
      // clean passwords from repo url
      repoUrl = repoUrl.replace(this.repoUrlPasswordRegex, '@');
    }
    return repoUrl;
  }

  get branch() {
    return this.deploymentObject && this.deploymentObject.sourceControls.properties.branch;
  }

  get scmType() {
    const isMerc: boolean = this.deploymentObject && this.deploymentObject.sourceControls.properties.isMercurial;
    return isMerc ? 'Mercurial' : 'Git';
  }

  get tableItems() {
    if (this._deploymentFetchTries > 10) {
      this.tableMessages.emptyMessage = this._translateService.instant(PortalResources.noDeploymentDataAvailable);
    }

    return this._tableItems || [];
  }
  get gitCloneUri() {
    const scmUri = this.deploymentObject && this.deploymentObject.publishingCredentials.properties.scmUri.split('@')[1];
    let siteName = this.deploymentObject && this.deploymentObject.site.name;

    // If site is a slot, we only care abou the primary site name, not the slot name
    if (siteName.includes('/')) {
      siteName = siteName.split('/')[0];
    }
    return this.deploymentObject && `https://${scmUri}:443/${siteName}.git`;
  }

  syncScm() {
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
        return this._cacheService
          .postArm(`${this.resourceId}/sync`, true)
          .switchMap(r => {
            this.viewInfoStream$.next(this.resourceId);
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

  disconnect() {
    const confirmResult = confirm(this._translateService.instant(PortalResources.disconnectConfirm));

    if (confirmResult) {
      let notificationId = null;
      this._busyManager.setBusy();
      const webConfig = this._armService.patch(
        `${this.deploymentObject.site.id}/config/web`,
        {
          properties: {
            scmType: 'None',
          },
        },
        ARMApiVersions.antaresApiVersion20181101
      );
      let sourceControlsConfig = of(null);
      if (this.deploymentObject.siteConfig.properties.scmType !== 'LocalGit') {
        sourceControlsConfig = this._armService.delete(`${this.deploymentObject.site.id}/sourcecontrols/web`);
      }

      this._portalService
        .startNotification(
          this._translateService.instant(PortalResources.disconnectingDeployment),
          this._translateService.instant(PortalResources.disconnectingDeployment)
        )
        .take(1)
        .do(notification => {
          notificationId = notification.id;
        })
        .concatMap(() => forkJoin(webConfig, sourceControlsConfig))
        .subscribe(
          r => {
            this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter);
            this._portalService.stopNotification(
              notificationId,
              true,
              this._translateService.instant(PortalResources.disconnectingDeploymentSuccess)
            );
            this._busyManager.clearBusy();
          },
          err => {
            this._portalService.stopNotification(
              notificationId,
              false,
              this._translateService.instant(PortalResources.disconnectingDeploymentFail)
            );
            this._logService.error(LogCategories.cicd, '/disconnect-kudu-dashboard', err);
          }
        );
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
        return 'Azure Repos';
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
  toggleExpandGroup(group) {
    this.table.groupHeader.toggleExpandGroup(group);
  }

  showDeploymentCredentials() {
    this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter, 'credentials-dashboard');
  }

  browseToSite() {
    this._browseToSite(this.deploymentObject);
  }
}
