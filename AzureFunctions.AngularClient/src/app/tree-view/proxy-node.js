"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
var resourceDescriptors_1 = require("./../shared/resourceDescriptors");
var tree_node_1 = require("./tree-node");
var dashboard_type_1 = require("./models/dashboard-type");
var portal_resources_1 = require("../shared/models/portal-resources");
var ProxyNode = (function (_super) {
    __extends(ProxyNode, _super);
    function ProxyNode(sideNav, _functionsNode, 
        //public functionInfo: FunctionInfo,
        proxy, parentNode) {
        var _this = _super.call(this, sideNav, proxy.functionApp.site.id + "/proxies/" + proxy.name, parentNode) || this;
        _this._functionsNode = _functionsNode;
        _this.proxy = proxy;
        _this.title = "Proxy";
        _this.dashboardType = dashboard_type_1.DashboardType.proxy;
        _this.showExpandIcon = false;
        _this.title = proxy.name;
        _this.iconClass = 'tree-node-svg-icon';
        _this.iconUrl = "images/api-proxy.svg";
        return _this;
    }
    ProxyNode.prototype.handleSelection = function () {
        if (!this.disabled) {
            return this.parent.parent.initialize();
        }
        return Observable_1.Observable.of({});
    };
    //public loadChildren(){
    //    this.children = [
    //        //new FunctionIntegrateNode(this.sideNav, this.functionInfo, this),
    //        //new FunctionManageNode(this.sideNav, this._functionsNode, this.functionInfo, this),
    //        //new FunctionMonitorNode(this.sideNav, this.functionInfo, this)
    //    ]
    //    return Observable.of(null);
    //}
    ProxyNode.prototype.getViewData = function () {
        return this.proxy;
    };
    ProxyNode.prototype.shouldBlockNavChange = function () {
        return ProxyNode.blockNavChangeHelper(this);
    };
    ProxyNode.prototype.dispose = function (newSelectedNode) {
        this.sideNav.broadcastService.clearAllDirtyStates();
        this.parent.dispose(newSelectedNode);
    };
    ProxyNode.blockNavChangeHelper = function (currentNode) {
        var canSwitchFunction = true;
        if (currentNode.sideNav.broadcastService.getDirtyState('function')
            || currentNode.sideNav.broadcastService.getDirtyState('function_integrate')
            || currentNode.sideNav.broadcastService.getDirtyState('api-proxy')) {
            var descriptor = new resourceDescriptors_1.FunctionDescriptor(currentNode.resourceId);
            canSwitchFunction = confirm(currentNode.sideNav.translateService.instant(portal_resources_1.PortalResources.sideBar_changeMade, {
                name: descriptor.functionName
            }));
        }
        return !canSwitchFunction;
    };
    return ProxyNode;
}(tree_node_1.TreeNode));
exports.ProxyNode = ProxyNode;
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
//# sourceMappingURL=proxy-node.js.map