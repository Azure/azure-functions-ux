import { BaseFunctionsProxiesNode } from 'app/tree-view/base-functions-proxies-node';
import { PortalResources } from './../shared/models/portal-resources';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';

import { TreeNode, MutableCollection, Disposable, CustomSelection, Collection } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { ApiProxy } from '../shared/models/api-proxy';
import { ProxyNode } from './proxy-node';
import { FunctionApp } from '../shared/function-app';

export class ProxiesNode extends BaseFunctionsProxiesNode implements MutableCollection, Disposable, CustomSelection, Collection {
    public title = this.sideNav.translateService.instant(PortalResources.appFunctionSettings_apiProxies);
    public dashboardType = DashboardType.ProxiesDashboard;
    public newDashboardType = DashboardType.CreateProxyDashboard;
    public nodeClass = 'tree-node collection-node';

    constructor(
        sideNav: SideNavComponent,
        public functionApp: FunctionApp,
        parentNode: TreeNode) {

        super(sideNav,
            functionApp.site.id + '/proxies',
            functionApp,
            parentNode,
            functionApp.site.id + '/proxies/new/proxy');

        this.iconClass = 'tree-node-collection-icon';
        this.iconUrl = 'images/BulletList.svg';
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

    public addChild(functionInfo: ApiProxy) {
        functionInfo.functionApp = this.functionApp;
        this.sideNav.cacheService.clearCachePrefix(this.functionApp.getScmUrl());

        const newNode = new ProxyNode(this.sideNav, functionInfo, this);
        this._addChildAlphabetically(newNode);
        newNode.select();
    }

    public removeChild(functionInfo: ApiProxy, callRemoveOnChild?: boolean) {

        const removeIndex = this.children.findIndex((childNode: ProxyNode) => {
            return childNode.proxy.name === functionInfo.name;
        });

        this._removeHelper(removeIndex, callRemoveOnChild);
    }

    public dispose(newSelectedNode?: TreeNode) {
        this.parent.dispose(newSelectedNode);
    }

    protected _updateTreeForNonUsableState(title: string) {
        this.disabled = true;
        this.newDashboardType = null;
        this.children = [];
        this.title = title;
        this.showExpandIcon = false;
        this.sideNav.cacheService.clearCachePrefix(`${this.functionApp.getScmUrl()}/api/functions`);
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
            return this.functionApp.getApiProxies()
                .map(proxies => {
                    const fcNodes = <ProxyNode[]>[];
                    proxies.forEach(proxy => {
                        proxy.functionApp = this.functionApp;
                        fcNodes.push(new ProxyNode(this.sideNav, proxy, this));
                    });

                    this.children = fcNodes;

                    return null;
                });
        } else {
            return Observable.of(null);
        }
    }
}
