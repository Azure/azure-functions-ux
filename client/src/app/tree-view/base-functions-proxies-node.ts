import { PortalResources } from './../shared/models/portal-resources';
import { FunctionAppContext } from './../shared/function-app-context';
import { Site, SiteAvailabilityState } from './../shared/models/arm/site';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { BroadcastService } from './../shared/services/broadcast.service';
import { LogCategories } from './../shared/models/constants';
import { LogService } from './../shared/services/log.service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { AuthzService } from './../shared/services/authz.service';
import { Observable } from 'rxjs/Observable';
import { SideNavComponent } from './../side-nav/side-nav.component';
import { TreeNode } from './tree-node';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionService } from 'app/shared/services/function.service';

interface ErrorTitles {
  noAccessTitle: string;
  nonReachableTitle: string;
  readOnlyTitle: string;
  stoppedTitle: string;
  limitedTitle: string;
}

interface WorkingTitles {
  default: { title: string; newDashboard: DashboardType };
  readOnly: { title: string; newDashboard: DashboardType };
}

export abstract class BaseFunctionsProxiesNode extends TreeNode {
  protected _logService: LogService;
  protected _functionAppService: FunctionAppService;
  protected _broadcastService: BroadcastService;
  protected _functionService: FunctionService;

  constructor(
    sideNav: SideNavComponent,
    resourceId: string,
    protected _context: FunctionAppContext,
    parentNode: TreeNode,
    createResourceId?: string
  ) {
    super(sideNav, resourceId, parentNode, createResourceId);

    this._logService = sideNav.injector.get(LogService);
    this._functionAppService = sideNav.injector.get(FunctionAppService);
    this._broadcastService = sideNav.injector.get(BroadcastService);
    this._functionService = sideNav.injector.get(FunctionService);
  }

  abstract loadChildren(): Observable<any>;

  protected abstract _updateTreeForStartedSite(title: string, newDashboard: DashboardType);

  protected abstract _updateTreeForNonUsableState(title: string);

  public baseLoadChildren(workingTitles: WorkingTitles, errorTitles: ErrorTitles): Observable<any> {
    return this.sideNav.cacheService
      .getArm(this._context.site.id)
      .map(i => i.json() as ArmObj<Site>)
      .concatMap(site => {
        if (site.properties.availabilityState !== SiteAvailabilityState.Normal) {
          this.disabledReason = this.sideNav.translateService.instant(PortalResources.limitedMode);
          return this._updateTreeForNonUsableState(errorTitles.limitedTitle);
        } else if (site.properties.state === 'Running') {
          this.isLoading = true;
          return Observable.zip(
            this.sideNav.authZService.hasPermission(this._context.site.id, [AuthzService.writeScope]),
            this.sideNav.authZService.hasReadOnlyLock(this._context.site.id),
            this._functionAppService.reachableInternalLoadBalancerApp(this._context),
            this._functionAppService
              .getFunctionAppEditMode(this._context)
              .map(r => (r.isSuccessful ? EditModeHelper.isReadOnly(r.result) : false)),
            this._functionAppService.pingScmSite(this._context).map(r => (r.isSuccessful ? r.result : false)),
            (p, l, r, isReadOnly, ping) => ({
              hasWritePermission: p,
              hasReadOnlyLock: l,
              reachable: r,
              isReadOnly: isReadOnly,
              pingedScmSite: ping,
            })
          )
            .switchMap(r => {
              if (r.hasWritePermission && !r.hasReadOnlyLock && r.reachable && !r.isReadOnly && r.pingedScmSite) {
                return this._updateTreeForStartedSite(workingTitles.default.title, workingTitles.default.newDashboard);
              } else if (r.hasWritePermission && !r.hasReadOnlyLock && r.reachable && r.isReadOnly && r.pingedScmSite) {
                return this._updateTreeForStartedSite(workingTitles.readOnly.title, workingTitles.readOnly.newDashboard);
              } else if (!r.hasWritePermission) {
                this.disabledReason = this.sideNav.translateService.instant(PortalResources.noAccessMode);
                return this._updateTreeForNonUsableState(errorTitles.noAccessTitle);
              } else if (!r.reachable) {
                this.disabledReason = this.sideNav.translateService.instant(PortalResources.nonReachableMode);
                return this._updateTreeForNonUsableState(errorTitles.nonReachableTitle);
              } else if (!r.pingedScmSite) {
                this.disabledReason = this.sideNav.translateService.instant(PortalResources.scmPingFailedErrorMessage);
                return this._updateTreeForNonUsableState(errorTitles.nonReachableTitle);
              } else {
                this.disabledReason = this.sideNav.translateService.instant(PortalResources.readOnlyMode);
                return this._updateTreeForNonUsableState(errorTitles.readOnlyTitle);
              }
            })
            .do(
              () => {
                this.isLoading = false;
              },
              err => {
                this._logService.error(LogCategories.SideNav, '/base-function-proxies-node/load-children', err);
                this.isLoading = false;
              }
            );
        } else {
          this.disabledReason = this.sideNav.translateService.instant(PortalResources.stoppedMode);
          return this._updateTreeForNonUsableState(errorTitles.stoppedTitle);
        }
      });
  }

  public handleSelection(): Observable<any> {
    this.parent.inSelectedTree = true;
    return Observable.of({});
  }
}
