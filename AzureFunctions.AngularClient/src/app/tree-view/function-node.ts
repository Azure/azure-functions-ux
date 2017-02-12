import { TreeNode, Removable } from './tree-node';
import {FunctionsNode} from './functions-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Subject } from 'rxjs/Rx';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { ArmObj } from '../shared/models/arm/arm-obj';
import {FunctionContainer} from '../shared/models/function-container';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {PortalResources} from '../shared/models/portal-resources';
import {FunctionInfo} from '../shared/models/function-info';

export class FunctionNode extends TreeNode{
    public title = "";
    public dashboardType = DashboardType.function;

    constructor(
        sideNav : SideNavComponent,
        private _functionsNode : FunctionsNode,
        public functionInfo : FunctionInfo,
        parentNode : TreeNode){

        super(sideNav,
            functionInfo.functionApp.site.id + "/functions/" + functionInfo.name,
            parentNode);

        this.title = functionInfo.name;
    }

    protected _loadChildren(){
        this.children = [
            new FunctionIntegrateNode(this.sideNav, this.functionInfo, this),
            new FunctionManageNode(this.sideNav, this._functionsNode, this.functionInfo, this),
            new FunctionMonitorNode(this.sideNav, this.functionInfo, this)
        ]

        this._doneLoading();
    }

    public getViewData() : any{
        return this.functionInfo;
    }
}

export class FunctionEditBaseNode extends TreeNode{
    public dashboardType = DashboardType.function;
    public showExpandIcon = false;
    
    constructor(
        sideNav : SideNavComponent,
        public functionInfo : FunctionInfo,
        resourceId : string,
        parentNode : TreeNode){

        super(sideNav, resourceId, parentNode);
    }

    public getViewData() : any{
        return this.functionInfo;
    }
}

export class FunctionIntegrateNode extends FunctionEditBaseNode{
    public title = "Integrate";

    constructor(
        sideNav : SideNavComponent,
        functionInfo : FunctionInfo,
        parentNode : TreeNode){

        super(sideNav,
            functionInfo,
            functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/integrate",
            parentNode);

        this.iconClass = "fa fa-flash tree-node-function-icon";
    }
}

export class FunctionManageNode extends FunctionEditBaseNode implements Removable{
    public title = "Manage";

    constructor(
        sideNav : SideNavComponent,
        private _functionsNode : FunctionsNode,
        functionInfo : FunctionInfo,
        parentNode : TreeNode){

        super(sideNav,
            functionInfo,
            functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/manage",
            parentNode);

        this.iconClass = "fa fa-cog tree-node-function-icon";
    }

    public remove(){
        this._functionsNode.removeChild(this.functionInfo, false);

        let defaultHostName = this._functionsNode.functionApp.site.properties.defaultHostName;
        let scmHostName = this._functionsNode.functionApp.site.properties.hostNameSslStates.find(s => s.hostType === 1).name;

        this.sideNav.cacheService.clearCachePrefix(`https://${defaultHostName}`);
        this.sideNav.cacheService.clearCachePrefix(`https://${scmHostName}`);

    }
}

export class FunctionMonitorNode extends FunctionEditBaseNode{
    public title = "Monitor";

    constructor(
        sideNav : SideNavComponent,
        functionInfo : FunctionInfo,
        parentNode : TreeNode){

        super(sideNav,
            functionInfo,
            functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/monitor",
            parentNode);

        this.iconClass = "fa fa-search tree-node-function-icon";
    }
}