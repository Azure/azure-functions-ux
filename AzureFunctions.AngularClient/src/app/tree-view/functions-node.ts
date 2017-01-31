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
import {FunctionNode} from './function-node';
import {FunctionApp} from '../shared/function-app';

export class FunctionsNode extends TreeNode{
    public title = "Functions";
    public dashboardType = DashboardType.collection;
    public newDashboardType = DashboardType.createFunction;
    // private _functionApp : FunctionApp;
    // private _functions : FunctionInfo[]; 

    constructor(sideNav : SideNavComponent, public functionApp : FunctionApp){
        super(sideNav, functionApp.site.id + "/functions");
    }

    protected _loadChildren(){
        this.functionApp.getFunctions()
        .subscribe(fcs =>{
            let fcNodes = <FunctionNode[]>[];
            fcs.forEach(fc => {
                fc.functionApp = this.functionApp;
                fcNodes.push(new FunctionNode(this.sideNav, this, fc))
            });

            this.children = fcNodes;
            this._doneLoading();
        });
    }

    public addChild(functionInfo : FunctionInfo){
        functionInfo.functionApp = this.functionApp;
        
        let newNode = new FunctionNode(this.sideNav, this, functionInfo);
        this.children.push(newNode);
        newNode.select();
    }

    public removeChild(functionInfo : FunctionInfo){
        
        let removeIndex = this.children.findIndex((childNode : FunctionNode) =>{
            return childNode.functionInfo.name === functionInfo.name;
        })

        if(removeIndex > -1){
            this.children.splice(removeIndex, 1);
        }
    }
    
}