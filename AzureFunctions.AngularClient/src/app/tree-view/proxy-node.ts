import { AppNode } from './app-node';
import { FunctionDescriptor } from './../shared/resourceDescriptors';
import { TreeNode, Removable, CanBlockNavChange, Disposable, CustomSelection } from './tree-node';
import { ProxiesNode } from './proxies-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Subject, Observable } from 'rxjs/Rx';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { ArmObj } from '../shared/models/arm/arm-obj';
import {FunctionContainer} from '../shared/models/function-container';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {PortalResources} from '../shared/models/portal-resources';
//import {FunctionInfo} from '../shared/models/function-info';
import {ApiProxy} from '../shared/models/api-proxy';

export class ProxyNode extends TreeNode implements CanBlockNavChange, Disposable, CustomSelection{
    public title = "Proxy";
    public dashboardType = DashboardType.proxy;
    public showExpandIcon = false;

    constructor(
        sideNav : SideNavComponent,
        private _functionsNode: ProxiesNode,
        //public functionInfo: FunctionInfo,
        public proxy: ApiProxy,
        parentNode : TreeNode){

        super(sideNav,
            proxy.functionApp.site.id + "/proxies/" + proxy.name,
            parentNode);

        this.title = proxy.name;
        this.iconClass = 'tree-node-api-proxy-icon';
    }

    public handleSelection() : Observable<any>{
        if(!this.disabled){
            return (<AppNode>this.parent.parent).initialize();
        }

        return Observable.of({});
    }

    //public loadChildren(){
    //    this.children = [
    //        //new FunctionIntegrateNode(this.sideNav, this.functionInfo, this),
    //        //new FunctionManageNode(this.sideNav, this._functionsNode, this.functionInfo, this),
    //        //new FunctionMonitorNode(this.sideNav, this.functionInfo, this)
    //    ]

    //    return Observable.of(null);
    //}

    public getViewData() : any{
        return this.proxy;
    }

    public shouldBlockNavChange() : boolean{
        return ProxyNode.blockNavChangeHelper(this);
    }

    public dispose(newSelectedNode? : TreeNode){
        this.sideNav.broadcastService.clearAllDirtyStates();
        this.parent.dispose(newSelectedNode);
    }

    public static blockNavChangeHelper(currentNode : TreeNode){
        var canSwitchFunction = true;
        if (currentNode.sideNav.broadcastService.getDirtyState('function')
            || currentNode.sideNav.broadcastService.getDirtyState('function_integrate')
            || currentNode.sideNav.broadcastService.getDirtyState('api-proxy')) {

            let descriptor = new FunctionDescriptor(currentNode.resourceId);

            canSwitchFunction = confirm(currentNode.sideNav.translateService.instant(
                PortalResources.sideBar_changeMade,
                { 
                    name: descriptor.functionName
                }));
        }

        return !canSwitchFunction;
    }
}

//export class FunctionEditBaseNode extends TreeNode implements CanBlockNavChange, Disposable, CustomSelection{
//    public dashboardType = DashboardType.function;
//    public showExpandIcon = false;
    
//    constructor(
//        sideNav : SideNavComponent,
//        public functionInfo : FunctionInfo,
//        resourceId : string,
//        public parentNode : TreeNode){

//        super(sideNav, resourceId, parentNode);
//    }

//    public handleSelection() : Observable<any>{
//        if(!this.disabled){
//            return (<AppNode>this.parent.parent.parent).initialize();
//        }

//        return Observable.of({});
//    }

//    public getViewData() : any{
//        return this.functionInfo;
//    }

//    public shouldBlockNavChange() : boolean{
//        return ProxyNode.blockNavChangeHelper(this);
//    }

//    public dispose(newSelectedNode? : TreeNode){
//        this.parentNode.dispose(newSelectedNode);
//    }
//}

//export class FunctionIntegrateNode extends FunctionEditBaseNode{
//    public title = "Integrate";

//    constructor(
//        sideNav : SideNavComponent,
//        functionInfo : FunctionInfo,
//        parentNode : TreeNode){

//        super(sideNav,
//            functionInfo,
//            functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/integrate",
//            parentNode);

//        this.iconClass = "fa fa-flash tree-node-function-icon";
//    }
//}

//export class FunctionManageNode extends FunctionEditBaseNode implements Removable{
//    public title = "Manage";

//    constructor(
//        sideNav : SideNavComponent,
//        private _functionsNode : FunctionsNode,
//        functionInfo : FunctionInfo,
//        parentNode : TreeNode){

//        super(sideNav,
//            functionInfo,
//            functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/manage",
//            parentNode);

//        this.iconClass = "fa fa-cog tree-node-function-icon";
//    }

//    public remove(){
//        this._functionsNode.removeChild(this.functionInfo, false);

//        let defaultHostName = this._functionsNode.functionApp.site.properties.defaultHostName;
//        let scmHostName = this._functionsNode.functionApp.site.properties.hostNameSslStates.find(s => s.hostType === 1).name;

//        this.sideNav.cacheService.clearCachePrefix(`https://${defaultHostName}`);
//        this.sideNav.cacheService.clearCachePrefix(`https://${scmHostName}`);

//    }
//}

//export class FunctionMonitorNode extends FunctionEditBaseNode{
//    public title = "Monitor";

//    constructor(
//        sideNav : SideNavComponent,
//        functionInfo : FunctionInfo,
//        parentNode : TreeNode){

//        super(sideNav,
//            functionInfo,
//            functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/monitor",
//            parentNode);

//        this.iconClass = "fa fa-search tree-node-function-icon";
//    }
//}