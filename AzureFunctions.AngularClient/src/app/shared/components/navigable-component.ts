import { TreeNode } from './../../tree-view/tree-node';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { Observable } from 'rxjs/Observable';
import { TreeViewInfo, SiteData } from '../../tree-view/models/tree-view-info';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import { DashboardType } from '../../tree-view/models/dashboard-type';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { SiteDescriptor, FunctionDescriptor } from 'app/shared/resourceDescriptors';
import { Subscription } from 'rxjs/Subscription';
import { ErrorableComponent } from './errorable-component';

// The filter can be any of these types. That way you can call it using
// super(broadcastService)
// super(broadacastService, DashboardType.ProxyDashboard)
// super(broadcastService, [DashboardType.FunctionsDashboard, DashboardType.FunctionDashboard])
// super(broadcastService, (view) => false)
type FilterType = DashboardType | DashboardType[] | ((view: TreeViewInfo<TreeNode>) => boolean);

export abstract class NavigableComponent extends ErrorableComponent implements OnDestroy {
    public viewInfo: TreeViewInfo<SiteData>;
    protected navigationEvents: Observable<TreeViewInfo<SiteData> & { siteDescriptor: SiteDescriptor; functionDescriptor: FunctionDescriptor }>;
    protected ngUnsubscribe: Observable<void>;
    private navigationSubscription: Subscription;
    private timeout: number;

    constructor(componentName: string, broadcastService: BroadcastService, filter?: FilterType) {
        super(componentName, broadcastService);
        this.ngUnsubscribe = new Subject();
        this.navigationEvents = broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
            .takeUntil(this.ngUnsubscribe)
            .filter(view => {
                if (typeof filter === 'undefined' || !filter) {
                    // If no filter was specified, then return all events.
                    return true;
                } else if (typeof filter === 'function') {
                    return filter(view);
                } else if (Array.isArray(filter)) {
                    return !!filter.find(i => i === view.dashboardType);
                } else {
                    return view.dashboardType === filter;
                }
            })
            .map(view => {
                let siteDescriptor: SiteDescriptor | null;
                let functionDescriptor: FunctionDescriptor | null;
                try {
                    siteDescriptor = new SiteDescriptor(view.resourceId);
                } catch {
                    siteDescriptor = null;
                }
                try {
                    functionDescriptor = new FunctionDescriptor(view.resourceId);
                } catch {
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

        this.timeout = setTimeout(() => {
            this.navigationSubscription = this.setupNavigation();
        });
    }

    abstract setupNavigation(): Subscription;

    ngOnDestroy(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
        (this.ngUnsubscribe as Subject<void>).next();
    }
}
