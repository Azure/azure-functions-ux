import { TreeNode } from './tree-node';
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
        private _functionInfo : FunctionInfo){

        super(sideNav, _functionInfo.functionApp.site.id + "/functions/" + _functionInfo.name + "/develop");
        this.title = _functionInfo.name;
    }

    protected _loadChildren(){
        this.children = [
            new FunctionIntegrateNode(this.sideNav, this._functionInfo),
            new FunctionManageNode(this.sideNav, this._functionInfo),
            new FunctionMonitorNode(this.sideNav, this._functionInfo)
        ]

        this._doneLoading();
    }

    public getViewData() : any{
        return this._functionInfo;
    }
}

export class FunctionEditNode extends TreeNode{
    public dashboardType = DashboardType.function;
    public showExpandIcon = false;
    
    constructor(
        sideNav : SideNavComponent,
        private _functionInfo : FunctionInfo,
        resourceId : string){

        super(sideNav, resourceId);
    }

    public getViewData() : any{
        return this._functionInfo;
    }
}

export class FunctionIntegrateNode extends FunctionEditNode{
    public title = "Integrate";

    constructor(
        sideNav : SideNavComponent,
        functionInfo : FunctionInfo){

        super(sideNav, functionInfo, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/integrate");

        this.iconClass = "fa fa-flash tree-node-function-icon";
    }
}

export class FunctionManageNode extends FunctionEditNode{
    public title = "Manage";

    constructor(
        sideNav : SideNavComponent,
        functionInfo : FunctionInfo){

        super(sideNav, functionInfo, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/manage");

        this.iconClass = "fa fa-cog tree-node-function-icon";
    }
}

export class FunctionMonitorNode extends FunctionEditNode{
    public title = "Monitor";

    constructor(
        sideNav : SideNavComponent,
        functionInfo : FunctionInfo){

        super(sideNav, functionInfo, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/monitor");

        this.iconClass = "fa fa-search tree-node-function-icon";
    }
}