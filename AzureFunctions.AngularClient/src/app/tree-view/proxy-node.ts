import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { AppNode } from './app-node';
import { TreeNode, CanBlockNavChange, Disposable, CustomSelection } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { ApiProxy } from '../shared/models/api-proxy';
import { FunctionNode } from "app/tree-view/function-node";

export class ProxyNode extends TreeNode implements CanBlockNavChange, Disposable, CustomSelection {
    public title = 'Proxy';
    public dashboardType = DashboardType.proxy;
    public showExpandIcon = false;

    constructor(
        sideNav: SideNavComponent,
        public proxy: ApiProxy,
        parentNode: TreeNode) {

        super(sideNav,
            proxy.functionApp.site.id + '/proxies/' + proxy.name,
            parentNode);

        this.title = proxy.name;
        this.iconClass = 'tree-node-svg-icon';
        this.iconUrl = 'images/api-proxy.svg';
    }

    public handleSelection(): Observable<any> {
        if (!this.disabled) {
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

    public getViewData(): any {
        return this.proxy;
    }

    public shouldBlockNavChange() {
        return FunctionNode.blockNavChangeHelper(this);
    }

    public dispose(newSelectedNode?: TreeNode) {
        this.sideNav.broadcastService.clearAllDirtyStates();
        this.parent.dispose(newSelectedNode);
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
// }

// export class FunctionMonitorNode extends FunctionEditBaseNode{
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
// }
