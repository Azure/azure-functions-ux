import { FunctionAppContext } from './../shared/function-app-context';
import { Subject } from 'rxjs/Subject';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TreeUpdateEvent } from './../shared/models/broadcast-event';
import { CacheService } from 'app/shared/services/cache.service';
import { FunctionDescriptor } from 'app/shared/resourceDescriptors';
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
import { Action } from '../shared/models/binding';
import { BaseFunctionsProxiesNode } from 'app/tree-view/base-functions-proxies-node';

export class FunctionsNode extends BaseFunctionsProxiesNode implements MutableCollection, Disposable, CustomSelection, Collection {
    public title = this.sideNav.translateService.instant(PortalResources.functions);
    public dashboardType = DashboardType.FunctionsDashboard;
    public newDashboardType = DashboardType.CreateFunctionAutoDetectDashboard;
    public action: Action;

    private _cacheService: CacheService;
    private _ngUnsubscribe = new Subject();

    constructor(
        sideNav: SideNavComponent,
        context: FunctionAppContext,
        parentNode: TreeNode) {
        super(sideNav,
            context.site.id + '/functions',
            context,
            parentNode,
            context.site.id + '/functions/new/function');

        this._cacheService = sideNav.injector.get(CacheService);

        this.iconClass = 'tree-node-collection-icon';
        this.iconUrl = 'image/BulletList.svg';
        this.nodeClass += ' collection-node';

        this._functionAppService.getFunctionAppEditMode(context)
            .map(r => r.isSuccessful ? EditModeHelper.isReadOnly(r.result) : false)
            .subscribe(isReadOnly => {
                if (isReadOnly) {
                    this.title = `${this.sideNav.translateService.instant(PortalResources.functions)} (${this.sideNav.translateService.instant(PortalResources.appFunctionSettings_readOnlyMode)})`;
                    this.newDashboardType = DashboardType.none;
                } else if (!this.disabled) {
                    this.title = this.sideNav.translateService.instant(PortalResources.functions);
                    this.newDashboardType = DashboardType.CreateFunctionAutoDetectDashboard;
                }
            });
    }

    public handleSelection(): Observable<any> {
        this._broadcastService.getEvents<TreeUpdateEvent>(BroadcastEvent.TreeUpdate)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(event => {
                if (event.operation === 'removeChild') {
                    this.removeChild(event.resourceId);
                } else if (event.operation === 'update') {
                    this.updateChild(event.resourceId, event.data);
                }
            });

        return Observable.of({});
    }

    public handleDeselection(newSelectedNode?: TreeNode) {
        this._ngUnsubscribe.next();
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
        this._cacheService.clearCachePrefix(this._context.urlTemplates.functionsUrl);

        const newNode = new FunctionNode(this.sideNav, this._context, functionInfo, this);
        this._addChildAlphabetically(newNode);
        newNode.select();
    }

    public removeChild(resourceId: string, callRemoveOnChild?: boolean) {

        const descriptor = new FunctionDescriptor(resourceId);
        resourceId = descriptor.getTrimmedResourceId();

        const removeIndex = this.children.findIndex(c => c.resourceId.toLowerCase() === resourceId.toLowerCase());
        this._removeHelper(removeIndex);
    }

    public updateChild(resourceId: string, disabled: boolean) {
        const descriptor = new FunctionDescriptor(resourceId);
        resourceId = descriptor.getTrimmedResourceId();

        const child = <FunctionNode>this.children.find(c => c.resourceId.toLowerCase() === resourceId.toLowerCase());
        if (child) {
            child.functionInfo.config.disabled = disabled;
        }
    }

    public openCreateDashboard(dashboardType: DashboardType, action?: Action) {
        this.newDashboardType = dashboardType;
        this.action = action;
        this.openCreateNew();
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
            return this._functionAppService.getFunctions(this._context)
                .map(fcs => {
                    const fcNodes = <FunctionNode[]>[];
                    if (fcs.isSuccessful) {
                        fcs.result.forEach(fc => {
                            fcNodes.push(new FunctionNode(this.sideNav, this._context, fc, this));
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
