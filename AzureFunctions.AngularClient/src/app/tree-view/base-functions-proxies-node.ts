import { AppNode } from './app-node';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { EditModeHelper } from './../shared/Utilities/edit-mode.helper';
import { AuthzService } from './../shared/services/authz.service';
import { Observable } from 'rxjs/Observable';
import { SideNavComponent } from './../side-nav/side-nav.component';
import { FunctionApp } from './../shared/function-app';
import { TreeNode } from './tree-node';
import { reachableInternalLoadBalancerApp } from 'app/shared/Utilities/internal-load-balancer';


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

    constructor(
        sideNav: SideNavComponent,
        resourceId: string,
        public functionApp: FunctionApp,
        parentNode: TreeNode,
        createResourceId?: string) {
        super(sideNav, resourceId, parentNode, createResourceId);
    }

    abstract loadChildren(): Observable<any>;

    protected abstract _updateTreeForStartedSite(title: string, newDashboard: DashboardType);

    protected abstract _updateTreeForNonUsableState(title: string);

    public baseLoadChildren(workingTitles: WorkingTitles, errorTitles: ErrorTitles) {
        if (this.functionApp.site.properties.state === 'Running') {
            return Observable.zip(
                this.sideNav.authZService.hasPermission(this.functionApp.site.id, [AuthzService.writeScope]),
                this.sideNav.authZService.hasReadOnlyLock(this.functionApp.site.id),
                reachableInternalLoadBalancerApp(this.functionApp, this.sideNav.cacheService),
                this.functionApp.getFunctionAppEditMode().map(EditModeHelper.isReadOnly),
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
                });
        } else {
            this.disabledReason = this.sideNav.translateService.instant('All functions are stopped. Start your app to view your functions.')
            return this._updateTreeForNonUsableState(this.sideNav.translateService.instant(errorTitles.stoppedTitle));
        }
    }

    public handleSelection(): Observable<any> {
        if (!this.disabled) {
            this.parent.inSelectedTree = true;
            return (<AppNode>this.parent).initialize();
        }

        return Observable.of({});
    }
}