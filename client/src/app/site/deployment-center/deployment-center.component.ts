import { SiteConfig } from '../../shared/models/arm/site-config';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import { BusyStateScopeManager } from './../../busy-state/busy-state-scope-manager';
import { Component, Input } from '@angular/core';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { TreeViewInfo, SiteData } from 'app/tree-view/models/tree-view-info';
import { LogCategories, SiteTabIds } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { SiteService } from '../../shared/services/site.service';
import { ProviderDashboardType } from './Models/deployment-enums';
import { CredentialsData } from './Models/deployment-data';

@Component({
  selector: 'app-deployment-center',
  templateUrl: './deployment-center.component.html',
  styleUrls: ['./deployment-center.component.scss'],
})
export class DeploymentCenterComponent implements OnDestroy {
  public resourceIdStream: Subject<string>;
  public resourceId: string;
  public credentialsData: CredentialsData;
  public viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
  public viewInfo: TreeViewInfo<SiteData>;
  public dashboardProviderType: ProviderDashboardType = '';

  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.viewInfo = viewInfo;
    this.viewInfoStream.next(viewInfo);
  }

  public hasWritePermissions = true;

  private _ngUnsubscribe$ = new Subject();
  private _siteConfigObject: ArmObj<SiteConfig>;
  private _busyManager: BusyStateScopeManager;

  public showFTPDashboard = false;
  public showWebDeployDashboard = false;
  sidePanelOpened = false;
  constructor(private _siteService: SiteService, private _logService: LogService, broadcastService: BroadcastService) {
    this._busyManager = new BusyStateScopeManager(broadcastService, SiteTabIds.continuousDeployment);

    this._logService.trace(LogCategories.cicd, '/load-deployment-center');

    this.viewInfoStream
      .takeUntil(this._ngUnsubscribe$)
      .switchMap(view => {
        this._busyManager.setBusy();
        this.resourceId = view.resourceId;
        this._siteConfigObject = null;
        this.credentialsData = {
          resourceId: this.resourceId,
        };
        return Observable.zip(
          this._siteService.getSiteConfig(this.resourceId),
          this._siteService.getAppSettings(this.resourceId),
          (sc, as) => ({
            siteConfig: sc.result,
            appSettings: as.result,
          })
        );
      })
      .subscribe(
        r => {
          this._siteConfigObject = r.siteConfig;
          if (r.appSettings.properties['WEBSITE_USE_ZIP']) {
            this.dashboardProviderType = 'zip';
          }
          this._busyManager.clearBusy();
        },
        err => {
          this._siteConfigObject = null;
          this._logService.error(LogCategories.cicd, '/load-deployment-center', err);
          this._busyManager.clearBusy();
        }
      );
    broadcastService
      .getEvents<string>(BroadcastEvent.ReloadDeploymentCenter)
      .takeUntil(this._ngUnsubscribe$)
      .subscribe(this.refreshedSCMType.bind(this));
  }

  refreshedSCMType(provider: ProviderDashboardType) {
    if (provider) {
      if (provider === 'reset') {
        this.dashboardProviderType = '';
      } else {
        this.dashboardProviderType = provider;
        this.sidePanelOpened = true;
      }
    } else {
      this._siteService.clearSiteConfigArmCache(this.resourceId);
      this.viewInfoStream.next(this.viewInfo);
    }
  }

  get kuduDeploymentSetup() {
    return this._siteConfigObject && this.scmType !== 'None' && this.scmType !== 'VSTSRM' && this.scmType !== 'GitHubAction';
  }

  get vstsDeploymentSetup() {
    return this.scmType === 'VSTSRM';
  }

  get noDeploymentSetup() {
    return this.scmType === 'None';
  }

  get githubActionDeploymentSetup() {
    return this.scmType === 'GitHubAction';
  }

  get scmType() {
    return this._siteConfigObject && this._siteConfigObject.properties.scmType;
  }

  ngOnDestroy() {
    this._ngUnsubscribe$.next();
  }
}
