import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
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
import { FunctionInfo } from '../shared/models/function-info';
import { FunctionNode } from './function-node';
import { FunctionApp } from '../shared/function-app';
import { Action } from '../shared/models/binding';

export class FunctionsNode extends TreeNode implements MutableCollection, Disposable, CustomSelection, Collection {
    public title = this.sideNav.translateService.instant(PortalResources.functions);
    public dashboardType = DashboardType.functions;
    public newDashboardType = DashboardType.createFunctionAutoDetect;
    public nodeClass = 'tree-node collection-node';
    public action: Action;

    constructor(
        sideNav: SideNavComponent,
        public functionApp: FunctionApp,
        parentNode: TreeNode) {
        super(sideNav, functionApp.site.id + '/functions', parentNode);

        this.iconClass = 'tree-node-collection-icon';
        this.iconUrl = 'images/BulletList.svg';

        functionApp.getFunctionAppEditMode()
            .map(EditModeHelper.isReadOnly)
            .subscribe(isReadOnly => {
                if (isReadOnly) {
                    this.title = `${this.sideNav.translateService.instant(PortalResources.functions)} (${this.sideNav.translateService.instant(PortalResources.appFunctionSettings_readOnlyMode)})`;
                    this.newDashboardType = DashboardType.none;
                } else {
                    this.title = this.sideNav.translateService.instant(PortalResources.functions);
                    this.newDashboardType = DashboardType.createFunctionAutoDetect;
                }
            });
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
                        return this._updateTreeForNonUsableState(this.sideNav.translateService.instant(PortalResources.sideNav_FunctionsNoAccess));
                    } else {
                        return this._updateTreeForNonUsableState(this.sideNav.translateService.instant(PortalResources.sideNav_FunctionsReadOnlyLock));
                    }
                });
        } else {
            return this._updateTreeForNonUsableState(this.sideNav.translateService.instant(PortalResources.sideNav_FunctionsStopped));
        }
    }

    public handleSelection(): Observable<any> {
        if (!this.disabled) {
            this.parent.inSelectedTree = true;
            return (<AppNode>this.parent).initialize();
        }

        return Observable.of({});
    }

    public addChild(functionInfo: FunctionInfo) {
        functionInfo.functionApp = this.functionApp;
        this.sideNav.cacheService.clearCachePrefix(this.functionApp.getScmUrl());

        const newNode = new FunctionNode(this.sideNav, this, functionInfo, this);
        this._addChildAlphabetically(newNode);
        newNode.select();
    }

    public removeChild(functionInfo: FunctionInfo, callRemoveOnChild?: boolean) {

        const removeIndex = this.children.findIndex((childNode: FunctionNode) => {
            return childNode.functionInfo.name === functionInfo.name;
        });

        this._removeHelper(removeIndex, callRemoveOnChild);
    }

    public openCreateDashboard(dashboardType: DashboardType, action?: Action) {
        this.newDashboardType = dashboardType;
        this.action = action;
        this.openCreateNew();
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
        this.showExpandIcon = true;

        if (this.parent.inSelectedTree) {
            this.inSelectedTree = true;
        }

        if (!this.children || this.children.length === 0) {
            return this.functionApp.getFunctions()
                .map(fcs => {
                    const fcNodes = <FunctionNode[]>[];
                    fcs.forEach(fc => {
                        fc.functionApp = this.functionApp;
                        fcNodes.push(new FunctionNode(this.sideNav, this, fc, this))
                    });

                    this.children = fcNodes;

                    return null;
                });
        } else {
            return Observable.of(null);
        }
    }
}
