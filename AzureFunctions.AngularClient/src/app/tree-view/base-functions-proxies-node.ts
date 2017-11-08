import { BroadcastService } from './../shared/services/broadcast.service';
import { FunctionAppContext, FunctionsService } from './../shared/services/functions-service';
import { LogCategories } from './../shared/models/constants';
import { LogService } from './../shared/services/log.service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { AuthzService } from './../shared/services/authz.service';
import { Observable } from 'rxjs/Observable';
import { SideNavComponent } from './../side-nav/side-nav.component';
import { TreeNode } from './tree-node';

interface ErrorTitles {
    noAccessTitle: string;
    nonReachableTitle: string;
    readOnlyTitle: string;
    stoppedTitle: string;
}

interface WorkingTitles {
    default: { title: string, newDashboard: DashboardType };
    readOnly: { title: string, newDashboard: DashboardType };
}

export abstract class BaseFunctionsProxiesNode extends TreeNode {

    protected _logService: LogService;
    protected _functionsService: FunctionsService;
    protected _broadcastService: BroadcastService;

    constructor(
        sideNav: SideNavComponent,
        resourceId: string,
        protected _context: FunctionAppContext,
        parentNode: TreeNode,
        createResourceId?: string) {
        super(sideNav, resourceId, parentNode, createResourceId);

        this._logService = sideNav.injector.get(LogService);
        this._functionsService = sideNav.injector.get(FunctionsService);
        this._broadcastService = sideNav.injector.get(BroadcastService);
    }

    abstract loadChildren(): Observable<any>;

    protected abstract _updateTreeForStartedSite(title: string, newDashboard: DashboardType);

    protected abstract _updateTreeForNonUsableState(title: string);

    public baseLoadChildren(workingTitles: WorkingTitles, errorTitles: ErrorTitles): Observable<any> {
        if (this._context.site.properties.state === 'Running') {
            this.isLoading = true;
            return Observable.zip(
                this.sideNav.authZService.hasPermission(this._context.site.id, [AuthzService.writeScope]),
                this.sideNav.authZService.hasReadOnlyLock(this._context.site.id),
                this._functionsService.reachableInternalLoadBalancerApp(this._context, this.sideNav.cacheService),
                this._functionsService.getFunctionAppEditMode(this._context).map(EditModeHelper.isReadOnly),
                (p, l, r, isReadOnly) => ({ hasWritePermission: p, hasReadOnlyLock: l, reachable: r, isReadOnly: isReadOnly }))
                .switchMap(r => {
                    if (r.hasWritePermission && !r.hasReadOnlyLock && r.reachable && !r.isReadOnly) {
                        return this._updateTreeForStartedSite(workingTitles.default.title, workingTitles.default.newDashboard);
                    } else if (r.hasWritePermission && !r.hasReadOnlyLock && r.reachable && r.isReadOnly) {
                        return this._updateTreeForStartedSite(workingTitles.readOnly.title, workingTitles.readOnly.newDashboard);
                    } else if (!r.hasWritePermission) {
                        this.disabledReason = this.sideNav.translateService.instant('You do not have write permissions to this app.')
                        return this._updateTreeForNonUsableState(errorTitles.noAccessTitle);
                    } else if (!r.reachable) {
                        this.disabledReason = this.sideNav.translateService.instant(
                            'Functions running behind an internal load balancer are not accessible outside their VNET. Please make sure you are in the same VNET as the functions to access them.');
                        return this._updateTreeForNonUsableState(errorTitles.nonReachableTitle);
                    } else {
                        this.disabledReason = this.sideNav.translateService.instant('You have read only access. Functions require write access to view');
                        return this._updateTreeForNonUsableState(errorTitles.readOnlyTitle);
                    }
                })
                .do(() => {
                    this.isLoading = false;
                }, err => {
                    this._logService.error(LogCategories.SideNav, '/base-function-proxies-node/load-children', err);
                    this.isLoading = false;
                });
        } else {
            this.disabledReason = this.sideNav.translateService.instant('All functions are stopped. Start your app to view your functions.')
            return this._updateTreeForNonUsableState(this.sideNav.translateService.instant(errorTitles.stoppedTitle));
        }
    }

    public handleSelection(): Observable<any> {
        this.parent.inSelectedTree = true;
        return Observable.of({});
    }
}