import { FunctionAppContext } from 'app/shared/function-app-context';
import { GlobalStateService } from './../shared/services/global-state.service';
import { Subject } from 'rxjs/Subject';
import { FunctionsNode } from './functions-node';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TreeUpdateEvent } from './../shared/models/broadcast-event';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { FunctionDescriptor } from './../shared/resourceDescriptors';
import { TreeNode, Removable, CanBlockNavChange, Disposable, CustomSelection } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { PortalResources } from '../shared/models/portal-resources';
import { FunctionInfo } from '../shared/models/function-info';
import { Url } from 'app/shared/Utilities/url';

export class FunctionNode extends TreeNode implements CanBlockNavChange, Disposable, CustomSelection {
    public dashboardType = DashboardType.FunctionDashboard;
    public supportsTab: boolean;
    private _globalStateService: GlobalStateService;
    private _broadcastService: BroadcastService;
    private _ngUnsubscribe = new Subject();

    public static blockNavChangeHelper(currentNode: TreeNode) {
        let canSwitchFunction = true;
        if (currentNode.sideNav.broadcastService.getDirtyState('function')
            || currentNode.sideNav.broadcastService.getDirtyState('function_integrate')
            || currentNode.sideNav.broadcastService.getDirtyState('api-proxy')) {

            const descriptor = new FunctionDescriptor(currentNode.resourceId);

            canSwitchFunction = confirm(currentNode.sideNav.translateService.instant(
                PortalResources.sideBar_changeMade,
                {
                    name: descriptor.name
                }));
        }

        return !canSwitchFunction;
    }

    constructor(
        sideNav: SideNavComponent,
        private context: FunctionAppContext,
        public functionInfo: FunctionInfo,
        parentNode: TreeNode) {

        super(sideNav,
            context.site.id + '/functions/' + functionInfo.name,
            parentNode);

        this._broadcastService = sideNav.injector.get(BroadcastService);
        this._globalStateService = sideNav.injector.get(GlobalStateService);

        this.iconClass = 'tree-node-svg-icon';
        this.iconUrl = 'image/function_f.svg';
        this.supportsTab = (Url.getParameterByName(null, 'appsvc.feature') === 'tabbed');
    }

    // This will be called on every change detection run. So I'm making sure to always
    // return the same exact object every time.
    public get title(): string {

        const disabledStr = this.sideNav.translateService.instant(PortalResources.disabled).toLocaleLowerCase();

        return this.functionInfo.config.disabled
            ? `(${disabledStr}) ${this.functionInfo.name}`
            : this.functionInfo.name;
    }

    public get functionName(): string {
        return this.functionInfo.name;
    }

    public handleSelection(): Observable<any> {
        this._broadcastService.getEvents<TreeUpdateEvent>(BroadcastEvent.TreeUpdate)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(event => {

                if (event.operation === 'navigate'
                    && event.resourceId.toLowerCase() === this.parent.parent.resourceId.toLowerCase()) {
                    this.parent.parent.select(event.data);
                    this._broadcastService.broadcastEvent<string>(BroadcastEvent.OpenTab, event.data);
                }
            });
        return Observable.of({});
    }

    public handleDeselection(newSelectedNode?: TreeNode) {
        this._globalStateService.setTopBarNotifications([]);
        this.sideNav.broadcastService.clearAllDirtyStates();
        this._ngUnsubscribe.next();
    }

    public loadChildren() {
        this.children = [
            new FunctionIntegrateNode(this.sideNav, this.context, this.functionInfo, this),
            new FunctionManageNode(this.sideNav, this.context, this.functionInfo, this),
        ];

        if (!this.sideNav.configService.isStandalone()) {
            this.children.push(new FunctionMonitorNode(this.sideNav, this.context, this.functionInfo, this));
        }

        return Observable.of(null);
    }

    public getViewData(): any {
        return this.functionInfo;
    }

    public shouldBlockNavChange(): boolean {
        return FunctionNode.blockNavChangeHelper(this);
    }
}

export class FunctionEditBaseNode extends TreeNode implements CanBlockNavChange, Disposable, CustomSelection {
    public showExpandIcon = false;
    private _broadcastService: BroadcastService;
    private _ngUnsubscribe = new Subject();
    private _globalStateService: GlobalStateService;

    constructor(
        sideNav: SideNavComponent,
        public functionInfo: FunctionInfo,
        resourceId: string,
        public parentNode: TreeNode) {

        super(sideNav, resourceId, parentNode);
        this._broadcastService = sideNav.injector.get(BroadcastService);
        this._globalStateService = sideNav.injector.get(GlobalStateService);
    }

    public getViewData(): any {
        return this.functionInfo;
    }

    public shouldBlockNavChange(): boolean {
        return FunctionNode.blockNavChangeHelper(this);
    }

    public handleSelection(): Observable<any> {
        this._broadcastService.getEvents<TreeUpdateEvent>(BroadcastEvent.TreeUpdate)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(event => {
                if (event.operation === 'remove') {
                    (<FunctionsNode>this.parent.parent).removeChild(event.resourceId);
                    this.handleDeselection();
                } else if (event.operation === 'update') {
                    this.functionInfo.config.disabled = event.data;
                } else if (event.operation === 'navigate'
                    && event.resourceId.toLowerCase() === this.parent.parent.parent.resourceId.toLowerCase()) {
                    this.parent.parent.parent.select();
                    this._broadcastService.broadcastEvent<string>(BroadcastEvent.OpenTab, event.data);
                }
            });

        return Observable.of({});
    }

    public handleDeselection(newSelectedNode?: TreeNode) {
        this._ngUnsubscribe.next();
        this._globalStateService.setTopBarNotifications([]);
    }
}

export class FunctionIntegrateNode extends FunctionEditBaseNode {
    public dashboardType = DashboardType.FunctionIntegrateDashboard;
    public title = this.sideNav.translateService.instant(PortalResources.tabNames_integrate);

    constructor(
        sideNav: SideNavComponent,
        context: FunctionAppContext,
        functionInfo: FunctionInfo,
        parentNode: TreeNode) {

        super(sideNav,
            functionInfo,
            context.site.id + '/functions/' + functionInfo.name + '/integrate',
            parentNode);

        this.iconClass = 'fa fa-flash tree-node-function-edit-icon link';
    }
}

export class FunctionManageNode extends FunctionEditBaseNode implements Removable {
    public dashboardType = DashboardType.FunctionManageDashboard;
    public title = this.sideNav.translateService.instant(PortalResources.tabNames_manage);;

    constructor(
        sideNav: SideNavComponent,
        context: FunctionAppContext,
        functionInfo: FunctionInfo,
        parentNode: TreeNode) {

        super(sideNav,
            functionInfo,
            context.site.id + '/functions/' + functionInfo.name + '/manage',
            parentNode);

        this.iconClass = 'fa fa-cog tree-node-function-edit-icon link';
    }
}

export class FunctionMonitorNode extends FunctionEditBaseNode {
    public dashboardType = DashboardType.FunctionMonitorDashboard;
    public title = this.sideNav.translateService.instant(PortalResources.tabNames_monitor);;

    constructor(
        sideNav: SideNavComponent,
        context: FunctionAppContext,
        functionInfo: FunctionInfo,
        parentNode: TreeNode) {

        super(sideNav,
            functionInfo,
            context.site.id + '/functions/' + functionInfo.name + '/monitor',
            parentNode);

        this.iconClass = 'fa fa-search tree-node-function-edit-icon link';
    }
}
