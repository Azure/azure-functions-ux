import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs/Rx';
import { SimpleChanges, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { DeploymentData } from '../../Models/deployment-data';
import { Component, Input, OnChanges } from '@angular/core';
import { LogCategories, SiteTabIds } from '../../../../shared/models/constants';
import { BusyStateScopeManager } from '../../../../busy-state/busy-state-scope-manager';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { DeploymentDashboard } from '../deploymentDashboard';
import { SiteService } from '../../../../shared/services/site.service';
import { LogService } from '../../../../shared/services/log.service';
import { BroadcastEvent } from '../../../../shared/models/broadcast-event';

@Component({
  selector: 'app-github-action-dashboard',
  templateUrl: './github-action-component.html',
  styleUrls: ['./github-action-component.scss'],
})
export class GithubActionComponent extends DeploymentDashboard implements OnChanges, OnDestroy {
  @Input()
  resourceId: string;

  public deploymentObject: DeploymentData;
  public respositoryText: string;
  public branchText: string;

  private _viewInfoStream$ = new Subject<string>();
  private _ngUnsubscribe$ = new Subject();
  private _busyManager: BusyStateScopeManager;
  private _forceLoad = false;

  constructor(
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

  public disconnect() {}

  public githubActionOnClick() {}

  public repositoryOnClick() {
    const repoUrl = this.deploymentObject && this.deploymentObject.sourceControls.properties.repoUrl;
    if (repoUrl) {
      const win = window.open(repoUrl, '_blank');
      win.focus();
    }
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

          this.respositoryText = this.deploymentObject.sourceControls.properties.repoUrl;
          this.branchText = this.deploymentObject.sourceControls.properties.branch;
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
    this.respositoryText = null;
    this.branchText = null;
  }
}
