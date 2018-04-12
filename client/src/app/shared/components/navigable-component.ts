import { Injector } from '@angular/core/src/core';
import { TreeNode } from './../../tree-view/tree-node';
import { Observable } from 'rxjs/Observable';
import { TreeViewInfo, SiteData } from '../../tree-view/models/tree-view-info';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { DashboardType } from '../../tree-view/models/dashboard-type';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { ArmSiteDescriptor, ArmFunctionDescriptor } from 'app/shared/resourceDescriptors';
import { FeatureComponent } from './feature-component';

// The filter can be any of these types. That way you can call it using
// super(broadcastService)
// super(broadacastService, DashboardType.ProxyDashboard)
// super(broadcastService, [DashboardType.FunctionsDashboard, DashboardType.FunctionDashboard])
// super(broadcastService, (view) => false)
type FilterType = DashboardType | DashboardType[] | ((view: TreeViewInfo<TreeNode>) => boolean);

export type ExtendedTreeViewInfo = TreeViewInfo<SiteData> & { siteDescriptor: ArmSiteDescriptor; functionDescriptor: ArmFunctionDescriptor };

export class NavigableComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
    public viewInfo: ExtendedTreeViewInfo;

    constructor(componentName: string, injector: Injector, private _filter?: FilterType) {
        super(componentName, injector, 'dashboard');

        // NavigableComponents will always inherently be parent components for a feature
        this.isParentComponent = true;

        // Since NavigableComponents are always top-level components, it makes sense
        // to name the feature after them.
        this.featureName = componentName;

        setTimeout(() => {
            this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
                .takeUntil(this.ngUnsubscribe)
                .subscribe(view => {
                    this.setInput(view);
                });
        });
    }

    protected setup(inputEvents: Observable<TreeViewInfo<any>>) {
        return inputEvents
            .filter(view => {
                if (typeof this._filter === 'undefined' || !this._filter) {
                    // If no filter was specified, then return all events.
                    return true;
                } else if (typeof this._filter === 'function') {
                    return this._filter(view);
                } else if (Array.isArray(this._filter)) {
                    return !!this._filter.find(i => i === view.dashboardType);
                } else {
                    return view.dashboardType === this._filter;
                }
            })
            .map(view => {
                let siteDescriptor: ArmSiteDescriptor | null;
                let functionDescriptor: ArmFunctionDescriptor | null;
                try {
                    siteDescriptor = new ArmSiteDescriptor(view.resourceId);
                } catch (_) {
                    siteDescriptor = null;
                }
                try {
                    functionDescriptor = new ArmFunctionDescriptor(view.resourceId);
                } catch (_) {
                    functionDescriptor = null;
                }
                return Object.assign(view, {
                    siteDescriptor: siteDescriptor,
                    functionDescriptor: functionDescriptor
                });
            })
            .do(v => {
                this.viewInfo = v;
            });
    }
}
