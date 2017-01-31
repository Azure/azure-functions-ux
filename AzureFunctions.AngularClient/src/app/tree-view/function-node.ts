import { TreeNode } from './tree-node';
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
        public functionInfo : FunctionInfo){

        super(sideNav, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/develop");
        this.title = functionInfo.name;
    }

    protected _loadChildren(){
        this.children = [
            new FunctionIntegrateNode(this.sideNav, this.functionInfo),
            new FunctionManageNode(this.sideNav, this._functionsNode, this.functionInfo),
            new FunctionMonitorNode(this.sideNav, this.functionInfo)
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
        resourceId : string){

        super(sideNav, resourceId);
    }

    public getViewData() : any{
        return this.functionInfo;
    }
}

export class FunctionIntegrateNode extends FunctionEditBaseNode{
    public title = "Integrate";

    constructor(
        sideNav : SideNavComponent,
        functionInfo : FunctionInfo){

        super(sideNav, functionInfo, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/integrate");

        this.iconClass = "fa fa-flash tree-node-function-icon";
    }
}

export class FunctionManageNode extends FunctionEditBaseNode{
    public title = "Manage";

    constructor(
        sideNav : SideNavComponent,
        private _functionsNode : FunctionsNode,
        functionInfo : FunctionInfo){

        super(sideNav, functionInfo, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/manage");

        this.iconClass = "fa fa-cog tree-node-function-icon";
    }

    public remove(){
        this._functionsNode.removeChild(this.functionInfo);
        this.sideNav.clearView();
    }
}

export class FunctionMonitorNode extends FunctionEditBaseNode{
    public title = "Monitor";

    constructor(
        sideNav : SideNavComponent,
        functionInfo : FunctionInfo){

        super(sideNav, functionInfo, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/monitor");

        this.iconClass = "fa fa-search tree-node-function-icon";
    }
}