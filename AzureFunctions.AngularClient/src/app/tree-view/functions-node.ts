import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';

import { TreeNode, MutableCollection, Disposable, CustomSelection, Collection } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { PortalResources } from '../shared/models/portal-resources';
import { FunctionInfo } from '../shared/models/function-info';
import { FunctionNode } from './function-node';
import { FunctionApp } from '../shared/function-app';
import { Action } from '../shared/models/binding';
import { BaseFunctionsProxiesNode } from 'app/tree-view/base-functions-proxies-node';

export class FunctionsNode extends BaseFunctionsProxiesNode implements MutableCollection, Disposable, CustomSelection, Collection {
    public title = this.sideNav.translateService.instant(PortalResources.functions);
    public dashboardType = DashboardType.FunctionsDashboard;
    public newDashboardType = DashboardType.CreateFunctionAutoDetectDashboard;
    public nodeClass = 'tree-node collection-node';
    public action: Action;

    constructor(
        sideNav: SideNavComponent,
        public functionApp: FunctionApp,
        parentNode: TreeNode) {
        super(sideNav,
            functionApp.site.id + '/functions',
            functionApp,
            parentNode,
            functionApp.site.id + '/functions/new/function');

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
                    this.newDashboardType = DashboardType.CreateFunctionAutoDetectDashboard;
                }
            });
    }

    public loadChildren() {
        return this.baseLoadChildren({
            default: {
                title: this.sideNav.translateService.instant(PortalResources.functions),
                newDashboard: DashboardType.CreateFunctionAutoDetectDashboard
            },
            readOnly: {
                title: `${this.sideNav.translateService.instant(PortalResources.functions)} (${this.sideNav.translateService.instant(PortalResources.appFunctionSettings_readOnlyMode)})`,
                newDashboard: DashboardType.none
            }
        }, {
                stoppedTitle: this.sideNav.translateService.instant(PortalResources.sideNav_FunctionsStopped),
                noAccessTitle: this.sideNav.translateService.instant(PortalResources.sideNav_FunctionsNoAccess),
                nonReachableTitle: this.sideNav.translateService.instant('Functions (Inaccessible)'),
                readOnlyTitle: this.sideNav.translateService.instant(PortalResources.sideNav_FunctionsReadOnlyLock)
            });
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
