import { TreeNode, MutableCollection } from './tree-node';
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

export class FunctionsNode extends TreeNode implements MutableCollection{
    public title = "Functions";
    public dashboardType = DashboardType.collection;
    public newDashboardType = DashboardType.createFunction;

    constructor(
        sideNav : SideNavComponent,
        public functionApp : FunctionApp,
        public parentNode : TreeNode){
        super(sideNav, functionApp.site.id + "/functions", parentNode);
    }

    protected _loadChildren(){
        if(this.functionApp.site.properties.state === "Running"){
            this.handleStartedSite();
        }
        else{
            this.handleStoppedSite();
        }
    }

    public addChild(functionInfo : FunctionInfo){
        functionInfo.functionApp = this.functionApp;
        
        let newNode = new FunctionNode(this.sideNav, this, functionInfo, this);
        this.children.push(newNode);
        newNode.select();
    }

    public removeChild(functionInfo : FunctionInfo, callRemoveOnChild? : boolean){
        
        let removeIndex = this.children.findIndex((childNode : FunctionNode) =>{
            return childNode.functionInfo.name === functionInfo.name;
        })

        this._removeHelper(removeIndex, callRemoveOnChild);
    }
    
    public handleStoppedSite(){
        this.newDashboardType = null;
        this.children = [];
        this.title = "Functions (Stopped)";
        this._doneLoading();
    }

    public handleStartedSite(){
        this.title = "Functions";
        this.newDashboardType = DashboardType.createFunction;
        this.isLoading = true;
        this.functionApp.getFunctions()
        .subscribe(fcs =>{
            let fcNodes = <FunctionNode[]>[];
            fcs.forEach(fc => {
                fc.functionApp = this.functionApp;
                fcNodes.push(new FunctionNode(this.sideNav, this, fc, this))
            });

            this.children = fcNodes;
            this._doneLoading();
        });        
    }
}