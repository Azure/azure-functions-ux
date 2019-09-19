import { ArmFunctionDescriptor } from './../shared/resourceDescriptors';
import { FunctionAppContext } from './../shared/function-app-context';
import { ApiProxy } from './../shared/models/api-proxy';
import { PortalResources } from './../shared/models/portal-resources';
import { Observable } from 'rxjs/Observable';
import { BaseFunctionsProxiesNode } from 'app/tree-view/base-functions-proxies-node';
import { TreeNode } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { ProxyNode } from './proxy-node';
import { BroadcastEvent } from './../shared/models/broadcast-event';
import { ErrorEvent } from './../shared/models/error-event';
import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { errorIds } from 'app/shared/models/error-ids';

export class ProxiesNode extends BaseFunctionsProxiesNode {
  public title = this.sideNav.translateService.instant(PortalResources.appFunctionSettings_apiProxies);
  public dashboardType = DashboardType.ProxiesDashboard;
  public newDashboardType = DashboardType.CreateProxyDashboard;
  public requiresAdvancedEditor: boolean = false;

  constructor(sideNav: SideNavComponent, context: FunctionAppContext, parentNode: TreeNode) {
    super(sideNav, context.site.id + '/proxies', context, parentNode, context.site.id + '/proxies/new/proxy');

    this.nodeClass += ' collection-node';
    this.iconClass = 'tree-node-collection-icon';
    this.iconUrl = 'image/BulletList.svg';

    this._functionAppService
      .getFunctionAppEditMode(context)
      .map(r => (r.isSuccessful ? EditModeHelper.isReadOnly(r.result) : false))
      .subscribe(isReadOnly => {
        if (isReadOnly) {
          this.title = this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesReadOnly);
          this.newDashboardType = DashboardType.none;
        } else if (!this.disabled) {
          this.title = this.sideNav.translateService.instant(PortalResources.appFunctionSettings_apiProxies);
          this.newDashboardType = DashboardType.CreateProxyDashboard;
        }
      });
  }

  public loadChildren() {
    return this.baseLoadChildren(
      {
        default: {
          title: this.sideNav.translateService.instant(PortalResources.appFunctionSettings_apiProxies),
          newDashboard: DashboardType.CreateProxyDashboard,
        },
        readOnly: {
          title: this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesReadOnly),
          newDashboard: DashboardType.none,
        },
      },
      {
        stoppedTitle: this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesStopped),
        limitedTitle: this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesLimited),
        noAccessTitle: this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesNoAccess),
        nonReachableTitle: this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesInaccessible),
        readOnlyTitle: this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesReadOnlyLock),
      }
    );
  }

  public addChild(proxy: ApiProxy) {
    const newNode = new ProxyNode(this.sideNav, proxy, this._context.site, this);
    this._addChildAlphabetically(newNode);
    newNode.select();
  }

  public removeChild(resourceId: string, callRemoveOnChild?: boolean) {
    const descriptor = new ArmFunctionDescriptor(resourceId);
    resourceId = descriptor.getTrimmedResourceId();

    const removeIndex = this.children.findIndex(c => c.resourceId.toLowerCase() === resourceId.toLowerCase());
    this._removeHelper(removeIndex);
  }

  public openCreateDashboard(dashboardType: DashboardType) {
    this.newDashboardType = dashboardType;
    this.openCreateNew();
  }

  public getProxyAdvancedEditorUrl() {
    return `${this._context.scmUrl}/dev/wwwroot/proxies.json`;
  }

  protected _updateTreeForNonUsableState(title: string) {
    this.disabled = true;
    this.newDashboardType = null;
    this.children = [];
    this.title = title;
    this.showExpandIcon = false;
    this.sideNav.cacheService.clearCachePrefix(`${this._context.scmUrl}/api/functions`);
    return Observable.of(null);
  }

  protected _updateTreeForStartedSite(title: string, newDashboardType: DashboardType) {
    this.title = title;
    this.newDashboardType = newDashboardType;

    this.showExpandIcon = true;

    if (this.parent.inSelectedTree) {
      this.inSelectedTree = true;
    }

    if (!this.children || this.children.length === 0) {
      return this._functionAppService.getApiProxies(this._context).map(response => {
        const fcNodes = <ProxyNode[]>[];
        if (response.isSuccessful) {
          this.requiresAdvancedEditor = false;

          response.result.forEach(proxy => {
            fcNodes.push(new ProxyNode(this.sideNav, proxy, this._context.site, this));
          });
        } else {
          if (!response.error || response.error.errorId !== errorIds.proxyJsonNotFound) {
            this.requiresAdvancedEditor = true;

            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
              errorId: response.error.errorId,
              message: response.error.message,
              resourceId: this._context.site.id,
            });
          }
        }

        this.children = fcNodes;

        return null;
      });
    } else {
      return Observable.of(null);
    }
  }
}
