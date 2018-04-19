import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';

import { AuthzService } from './../shared/services/authz.service';
import { AppNode } from './app-node';
import { TreeNode, MutableCollection, Disposable, CustomSelection, Collection } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { PortalResources } from '../shared/models/portal-resources';
import { ApiProxy } from '../shared/models/api-proxy';
import { ProxyNode } from './proxy-node';
import { FunctionApp } from '../shared/function-app';

export class ProxiesNode extends TreeNode implements MutableCollection, Disposable, CustomSelection, Collection {
    public title = 'Proxies (preview)';
    public dashboardType = DashboardType.proxies;
    public newDashboardType = DashboardType.createProxy;
    public nodeClass = 'tree-node collection-node';

    constructor(
        sideNav: SideNavComponent,
        public functionApp: FunctionApp,
        parentNode: TreeNode) {
        super(sideNav, functionApp.site.id + '/proxies', parentNode);

        this.iconClass = 'tree-node-collection-icon'
        this.iconUrl = 'images/BulletList.svg';
    }

    public loadChildren() {
        if (this.functionApp.site.properties.state === 'Running') {
            return Observable.zip(
                this.sideNav.authZService.hasPermission(this.functionApp.site.id, [AuthzService.writeScope]),
                this.sideNav.authZService.hasReadOnlyLock(this.functionApp.site.id),
                (p, l) => ({ hasWritePermission: p, hasReadOnlyLock: l }))
                .switchMap(r => {
                    if (r.hasWritePermission && !r.hasReadOnlyLock) {
                        return this._updateTreeForStartedSite();
                    } else if (!r.hasWritePermission) {
                        return this._updateTreeForNonUsableState(this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesNoAccess));
                    } else {
                        return this._updateTreeForNonUsableState(this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesReadOnlyLock));
                    }
                });

        } else {
            return this._updateTreeForNonUsableState(this.sideNav.translateService.instant(PortalResources.sideNav_ProxiesStopped));
        }
    }

    public handleSelection(): Observable<any> {
        if (!this.disabled) {
            this.parent.inSelectedTree = true;
            return (<AppNode>this.parent).initialize();
        }

        return Observable.of({});
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

    private _updateTreeForNonUsableState(title: string) {
        this.newDashboardType = null;
        this.children = [];
        this.title = title;
        this.showExpandIcon = false;
        this.sideNav.cacheService.clearCachePrefix(`${this.functionApp.getScmUrl()}/api/functions`);
        return Observable.of(null);
    }

    private _updateTreeForStartedSite() {
        this.title = this.sideNav.translateService.instant(PortalResources.appFunctionSettings_apiProxies);
        this.newDashboardType = DashboardType.createProxy;
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
