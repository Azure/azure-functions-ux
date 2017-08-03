import { FunctionApp } from './../shared/function-app';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { AppNode } from './app-node';
import { FunctionDescriptor } from './../shared/resourceDescriptors';
import { TreeNode, Removable, CanBlockNavChange, Disposable, CustomSelection } from './tree-node';
import { FunctionsNode } from './functions-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { PortalResources } from '../shared/models/portal-resources';
import { FunctionInfo } from '../shared/models/function-info';
import { Url } from 'app/shared/Utilities/url';

export class FunctionNode extends TreeNode implements CanBlockNavChange, Disposable, CustomSelection {
    public dashboardType = DashboardType.function;
    public supportsTab: boolean;

    constructor(
        sideNav: SideNavComponent,
        private _functionsNode: FunctionsNode,
        public functionInfo: FunctionInfo,
        parentNode: TreeNode) {

        super(sideNav,
            functionInfo.functionApp.site.id + '/functions/' + functionInfo.name,
            parentNode);
        this.iconClass = 'tree-node-svg-icon';
        this.iconUrl = 'images/function_f.svg';
        this.supportsTab = (Url.getParameterByName(window.location.href, 'appsvc.feature') === 'tabbed');
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
        if (!this.disabled) {
            return (<AppNode>this.parent.parent).initialize();
        }

        return Observable.of({});
    }

    public loadChildren() {
        this.children = [
            new FunctionIntegrateNode(this.sideNav, this.functionInfo, this),
            new FunctionManageNode(this.sideNav, this._functionsNode, this.functionInfo, this),
        ];

        if (!this.sideNav.configService.isStandalone()) {
            this.children.push(new FunctionMonitorNode(this.sideNav, this.functionInfo, this));
        }

        return Observable.of(null);
    }

    public getViewData(): any {
        return this.functionInfo;
    }

    public shouldBlockNavChange(): boolean {
        return FunctionNode.blockNavChangeHelper(this);
    }

    public dispose(newSelectedNode?: TreeNode) {
        this.sideNav.broadcastService.clearAllDirtyStates();
        this.parent.dispose(newSelectedNode);
    }

    public static blockNavChangeHelper(currentNode: TreeNode) {
        let canSwitchFunction = true;
        if (currentNode.sideNav.broadcastService.getDirtyState('function')
            || currentNode.sideNav.broadcastService.getDirtyState('function_integrate')
            || currentNode.sideNav.broadcastService.getDirtyState('api-proxy')) {

            const descriptor = new FunctionDescriptor(currentNode.resourceId);

            canSwitchFunction = confirm(currentNode.sideNav.translateService.instant(
                PortalResources.sideBar_changeMade,
                {
                    name: descriptor.functionName
                }));
        }

        return !canSwitchFunction;
    }
}

export class FunctionEditBaseNode extends TreeNode implements CanBlockNavChange, Disposable, CustomSelection {
    public showExpandIcon = false;

    constructor(
        sideNav: SideNavComponent,
        public functionInfo: FunctionInfo,
        resourceId: string,
        public parentNode: TreeNode) {

        super(sideNav, resourceId, parentNode);
    }

    public handleSelection(): Observable<any> {
        if (!this.disabled) {
            return (<AppNode>this.parent.parent.parent).initialize();
        }

        return Observable.of({});
    }

    public getViewData(): any {
        return this.functionInfo;
    }

    public shouldBlockNavChange(): boolean {
        return FunctionNode.blockNavChangeHelper(this);
    }

    public dispose(newSelectedNode?: TreeNode) {
        this.parentNode.dispose(newSelectedNode);
    }
}

export class FunctionIntegrateNode extends FunctionEditBaseNode {
    public dashboardType = DashboardType.functionIntegrate;
    public title = this.sideNav.translateService.instant(PortalResources.tabNames_integrate);

    constructor(
        sideNav: SideNavComponent,
        functionInfo: FunctionInfo,
        parentNode: TreeNode) {

        super(sideNav,
            functionInfo,
            functionInfo.functionApp.site.id + '/functions/' + functionInfo.name + '/integrate',
            parentNode);

        this.iconClass = 'fa fa-flash tree-node-function-edit-icon';
    }
}

export class FunctionManageNode extends FunctionEditBaseNode implements Removable {
    public dashboardType = DashboardType.functionManage;
    public title = this.sideNav.translateService.instant(PortalResources.tabNames_manage);;

    constructor(
        sideNav: SideNavComponent,
        private _functionsNode: FunctionsNode,
        functionInfo: FunctionInfo,
        parentNode: TreeNode) {

        super(sideNav,
            functionInfo,
            functionInfo.functionApp.site.id + '/functions/' + functionInfo.name + '/manage',
            parentNode);

        this.iconClass = 'fa fa-cog tree-node-function-edit-icon';
    }

    public remove() {
        this._functionsNode.removeChild(this.functionInfo, false);

        this.sideNav.cacheService.clearCachePrefix(
            FunctionApp.getMainUrl(this.sideNav.configService, this.functionInfo.functionApp.site));

        this.sideNav.cacheService.clearCachePrefix(
            FunctionApp.getScmUrl(this.sideNav.configService, this.functionInfo.functionApp.site));

    }
}

export class FunctionMonitorNode extends FunctionEditBaseNode {
    public dashboardType = DashboardType.functionMonitor;
    public title = this.sideNav.translateService.instant(PortalResources.tabNames_monitor);;

    constructor(
        sideNav: SideNavComponent,
        functionInfo: FunctionInfo,
        parentNode: TreeNode) {

        super(sideNav,
            functionInfo,
            functionInfo.functionApp.site.id + '/functions/' + functionInfo.name + '/monitor',
            parentNode);

        this.iconClass = 'fa fa-search tree-node-function-edit-icon';
    }
}
