import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs/Rx';
import { SimpleChanges, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { DeploymentData, Deployment } from '../../Models/deployment-data';
import { Component, Input, OnChanges } from '@angular/core';
import { LogCategories, SiteTabIds } from '../../../../shared/models/constants';
import { BusyStateScopeManager } from '../../../../busy-state/busy-state-scope-manager';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { DeploymentDashboard } from '../deploymentDashboard';
import { SiteService } from '../../../../shared/services/site.service';
import { LogService } from '../../../../shared/services/log.service';
import { BroadcastEvent } from '../../../../shared/models/broadcast-event';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { PortalService } from '../../../../shared/services/portal.service';
import * as moment from 'moment-mini-ts';
import { dateTimeComparatorReverse } from '../../../../shared/Utilities/comparators';
import { TableItem, GetTableHash } from 'app/controls/tbl/tbl.component';
import { ArmObj } from 'app/shared/models/arm/arm-obj';

enum DeployStatus {
  Pending,
  Building,
  Deploying,
  Failed,
  Success,
}

class GithubActionTableItem implements TableItem {
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
  selector: 'app-github-action-dashboard',
  templateUrl: './github-action-dashboard.component.html',
  styleUrls: ['./github-action-dashboard.component.scss'],
})
export class GithubActionDashboardComponent extends DeploymentDashboard implements OnChanges, OnDestroy {
  @Input()
  resourceId: string;

  public deploymentObject: DeploymentData;
  public repositoryText: string;
  public branchText: string;
  public githubActionLink: string;
  public sidePanelOpened = false;
  public hideCreds = false;

  private _viewInfoStream$ = new Subject<string>();
  private _ngUnsubscribe$ = new Subject();
  private _busyManager: BusyStateScopeManager;
  private _forceLoad = false;
  private _oldTableHash = 0;
  private _tableItems: GithubActionTableItem[];

  constructor(
    private _portalService: PortalService,
    private _logService: LogService,
    private _siteService: SiteService,
    private _broadcastService: BroadcastService,
    translateService: TranslateService
  ) {
    super(translateService);
    this._busyManager = new BusyStateScopeManager(_broadcastService, SiteTabIds.continuousDeployment);
    this._setupViewInfoStream();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['resourceId']) {
      this._busyManager.setBusy();
      this._viewInfoStream$.next(this.resourceId);
    }
  }

  public ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  public showDeploymentCredentials() {
    this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter, 'credentials-dashboard');
  }

  public browseToSite() {
    this._browseToSite(this.deploymentObject);
  }

  public refresh() {
    this._forceLoad = true;
    this._resetValues();
    this._viewInfoStream$.next(this.resourceId);
  }

  disconnect() {
    const confirmResult = confirm(this._translateService.instant(PortalResources.disconnectConfirm));
    if (confirmResult) {
      this._disconnectDeployment();
    }
  }

  public githubActionOnClick() {
    if (this.githubActionLink) {
      const win = window.open(this.githubActionLink, '_blank');
      win.focus();
    }
  }

  public repositoryOnClick() {
    const repoUrl = this.deploymentObject && this.deploymentObject.sourceControls.properties.repoUrl;
    if (repoUrl) {
      const win = window.open(repoUrl, '_blank');
      win.focus();
    }
  }

  public branchOnClick() {
    const repoUrl = this.deploymentObject && this.deploymentObject.sourceControls.properties.repoUrl;
    const branchUrl = `${repoUrl}/tree/${this.branchText}`;
    if (branchUrl) {
      const win = window.open(branchUrl, '_blank');
      win.focus();
    }
  }

  get tableItems() {
    if (this._deploymentFetchTries > 10) {
      this.tableMessages.emptyMessage = this._translateService.instant(PortalResources.noDeploymentDataAvailable);
    }

    return this._tableItems || [];
  }

  private _disconnectDeployment() {
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
      .concatMap(() => this._siteService.deleteSiteSourceControlConfig(this.resourceId))
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
          this._logService.error(LogCategories.cicd, '/disconnect-github-action-dashboard', err);
        }
      );
  }

  private _setupViewInfoStream() {
    this._viewInfoStream$
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

          this.repositoryText = this.deploymentObject.sourceControls.properties.repoUrl;
          this.githubActionLink = `${this.deploymentObject.sourceControls.properties.repoUrl}/actions`;
          this.branchText = this.deploymentObject.sourceControls.properties.branch;
          this._populateTable();
        },
        err => {
          this._busyManager.clearBusy();
          this._forceLoad = false;
          this.deploymentObject = null;
          this._logService.error(LogCategories.cicd, '/github-action-dashboard-initial-load', err);
        }
      );

    // refresh automatically every 5 seconds
    Observable.timer(5000, 5000)
      .takeUntil(this._ngUnsubscribe$)
      .subscribe(() => {
        this._deploymentFetchTries++;
        this._viewInfoStream$.next(this.resourceId);
      });
  }

  private _resetValues() {
    this.repositoryText = null;
    this.branchText = null;
  }

  private _populateTable() {
    const deployments = this.deploymentObject.deployments.value;
    const tableItems = deployments
      .filter(value => value.properties.deployer === 'GITHUB_ZIP_DEPLOY')
      .map(value => {
        const item = value.properties;
        const date: moment.Moment = moment(item.received_time);
        const t = moment(date);

        const commitId = item.id.substr(0, 7);
        const author = item.author;
        const row: GithubActionTableItem = {
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
}
