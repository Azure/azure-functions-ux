import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { VstsGithubHelper } from '../providerTools/vsts/vsts-github-provider';
import { providerHelper } from '../providerTools/providerHelper';
import { EssentialColumn } from '../Models/EssentialItem';
import { DeploymentData } from '../Models/deploymentData';
import { CacheService } from '../../shared/services/cache.service';
import { PortalService } from '../../shared/services/portal.service';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BusyStateScopeManager } from '../../busy-state/busy-state-scope-manager';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';

import { BusyStateComponent } from '../../busy-state/busy-state.component';
import { AuthzService } from '../../shared/services/authz.service';
import { AiService } from '../../shared/services/ai.service';
import { TranslateService } from '@ngx-translate/core';
import { SiteTabComponent } from '../../site/site-dashboard/site-tab/site-tab.component';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
@Component({
  selector: 'app-deployment-center-overview',
  templateUrl: './deployment-center-overview.component.html',
  styleUrls: ['./deployment-center-overview.component.scss']
})
export class DeploymentCenterOverviewComponent implements OnInit, OnChanges {


  public viewInfoStream: Subject<string>;
  private _viewInfoSubscription: RxSubscription;

  private _providerHelpers: providerHelper;
  private _writePermission = true;
  private _readOnlyLock = false;
  public hasWritePermissions = true;

  private _deploymentObject: DeploymentData;
  private _busyState: BusyStateComponent;
  private _busyStateScopeManager: BusyStateScopeManager;

  public EssentialColumns: EssentialColumn[];

  @Input() resourceId: string;

  constructor(
    private _translateService: TranslateService,
    private _portalService: PortalService,
    private _aiService: AiService,
    private _broadcastService: BroadcastService,
    private _authZService: AuthzService,
    siteTabsComponent: SiteTabComponent,
    private _cacheService: CacheService) {

    this.EssentialColumns = [];
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
          (site, siteConfig, metadata, pubCreds, sourceControl, deployments, writePerm, readLock) => (
            {
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
      .switchMap(r => {
        this._deploymentObject = {
          site: r.site,
          siteConfig: r.siteConfig,
          siteMetadata: r.metadata,
          sourceControls: r.sourceControl,
          publishingCredentials: r.pubCreds,
          deployments: r.deployments
        };
        this._providerHelpers = new VstsGithubHelper(this._cacheService);

        this._writePermission = r.writePermission;
        this._readOnlyLock = r.readOnlyLock;
        this.hasWritePermissions = r.writePermission && !r.readOnlyLock;
        this._busyStateScopeManager.clearBusy();
        return this._providerHelpers.getEssentialItems(this._deploymentObject);
      })
      .do(null, error => {
        this._deploymentObject = null;
        this._aiService.trackEvent('/errors/deployment-center', error);
        this._busyStateScopeManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this.EssentialColumns = r;
      });
    this._broadcastService.clearDirtyState('asiondaonisd', false);
    this._translateService.instant('key');
    this._portalService.closeBlades();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this.viewInfoStream.next(this.resourceId);
    }
  }

  get DeploymentSetUpComplete() {
    return this._deploymentObject && this._deploymentObject.siteConfig.properties.scmType !== 'None';
  }
  ngOnInit() {
  }
}
