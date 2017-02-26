import { AppNode } from './app-node';
import { FunctionDescriptor } from './../shared/resourceDescriptors';
import { TreeNode, MutableCollection, Disposable, CustomSelection, Collection} from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Subject, Observable } from 'rxjs/Rx';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { ArmObj } from '../shared/models/arm/arm-obj';
import {FunctionContainer} from '../shared/models/function-container';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {PortalResources} from '../shared/models/portal-resources';
import {FunctionInfo} from '../shared/models/function-info';
import {FunctionNode} from './function-node';
import {FunctionApp} from '../shared/function-app';

export class FunctionsNode extends TreeNode implements MutableCollection, Disposable, CustomSelection, Collection{
    public title = "Functions";
    public dashboardType = DashboardType.none;
    public newDashboardType = DashboardType.createFunction;

    constructor(
        sideNav : SideNavComponent,
        public functionApp : FunctionApp,
        parentNode : TreeNode){
        super(sideNav, functionApp.site.id + "/functions", parentNode);
    }

    public loadChildren(){
        if(this.functionApp.site.properties.state === "Running"){
            return this.updateTreeForStartedSite(false);
        }
        else{
            return this.updateTreeForStoppedSite();
        }
    }

    public handleSelection() : Observable<any>{
        if(!this.disabled){
            return (<AppNode>this.parent).initialize();
        }

        return Observable.of({});
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
    
    public dispose(newSelectedNode? : TreeNode){
        this.parent.dispose(newSelectedNode);
    }

    public updateTreeForStoppedSite(){
        this.newDashboardType = null;
        this.children = [];
        this.title = "Functions (Stopped)";
        this.showExpandIcon = false;
        this.sideNav.cacheService.clearCachePrefix(`${this.functionApp.getScmUrl()}/api/functions`);
        return Observable.of(null);
    }

    public updateTreeForStartedSite(forceLoadChildren : boolean){
        this.title = "Functions";
        this.newDashboardType = DashboardType.createFunction;
        this.showExpandIcon = true;

        if(forceLoadChildren || !this.children || this.children.length === 0){
            return this.functionApp.getFunctions()
            .map(fcs =>{
                let fcNodes = <FunctionNode[]>[];
                fcs.forEach(fc => {
                    fc.functionApp = this.functionApp;
                    fcNodes.push(new FunctionNode(this.sideNav, this, fc, this))
                });

                this.children = fcNodes;

                return null;
            });        
        }
        else{
            return Observable.of(null);
        }
    }
}