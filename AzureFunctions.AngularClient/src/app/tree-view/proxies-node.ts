import { FunctionAppContext } from './../shared/function-app-context';
import { FunctionDescriptor } from './../shared/resourceDescriptors';
import { ApiProxy } from './../shared/models/api-proxy';
import { PortalResources } from './../shared/models/portal-resources';
import { Observable } from 'rxjs/Observable';
import { BaseFunctionsProxiesNode } from 'app/tree-view/base-functions-proxies-node';
import { TreeNode } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { ProxyNode } from './proxy-node';

export class ProxiesNode extends BaseFunctionsProxiesNode {
    public title = this.sideNav.translateService.instant(PortalResources.appFunctionSettings_apiProxies);
    public dashboardType = DashboardType.ProxiesDashboard;
    public newDashboardType = DashboardType.CreateProxyDashboard;

    constructor(
        sideNav: SideNavComponent,
        context: FunctionAppContext,
        parentNode: TreeNode) {
        super(sideNav,
            context.site.id + '/proxies',
            context,
            parentNode,
            context.site.id + '/proxies/new/proxy');

        this.nodeClass += ' collection-node';
        this.iconClass = 'tree-node-collection-icon';
        this.iconUrl = 'image/BulletList.svg';
    }

    public loadChildren() {
        return this.baseLoadChildren({
            default: {
                title: this.sideNav.translateService.instant(PortalResources.appFunctionSettings_apiProxies),
                newDashboard: DashboardType.CreateProxyDashboard
            },
            readOnly: {
                title: `${this.sideNav.translateService.instant(PortalResources.appFunctionSettings_apiProxies)} (${this.sideNav.translateService.instant(PortalResources.appFunctionSettings_readOnlyMode)})`,
                newDashboard: DashboardType.none
            }
        }, {
                stoppedTitle: this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesStopped),
                noAccessTitle: this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesNoAccess),
                nonReachableTitle: this.sideNav.translateService.instant('Proxies (Inaccessible)'),
                readOnlyTitle: this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesReadOnlyLock)
            });
    }

    public addChild(proxy: ApiProxy) {
        const newNode = new ProxyNode(this.sideNav, proxy, this._context.site, this);
        this._addChildAlphabetically(newNode);
        newNode.select();
    }

    public removeChild(resourceId: string, callRemoveOnChild?: boolean) {

        const descriptor = new FunctionDescriptor(resourceId);
        resourceId = descriptor.getTrimmedResourceId();

        const removeIndex = this.children.findIndex(c => c.resourceId.toLowerCase() === resourceId.toLowerCase());
        this._removeHelper(removeIndex);
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
            return this._functionAppService.getApiProxies(this._context)
                .map(proxies => {
                    const fcNodes = <ProxyNode[]>[];
                    if (proxies.isSuccessful) {
                        proxies.result.forEach(proxy => {
                            fcNodes.push(new ProxyNode(this.sideNav, proxy, this._context.site, this));
                        });
                    }

                    this.children = fcNodes;

                    return null;
                });
        } else {
            return Observable.of(null);
        }
    }
}
