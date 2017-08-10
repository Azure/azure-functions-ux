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
var function_app_1 = require("./../shared/function-app");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
var resourceDescriptors_1 = require("./../shared/resourceDescriptors");
var tree_node_1 = require("./tree-node");
var dashboard_type_1 = require("./models/dashboard-type");
var portal_resources_1 = require("../shared/models/portal-resources");
var FunctionNode = (function (_super) {
    __extends(FunctionNode, _super);
    function FunctionNode(sideNav, _functionsNode, functionInfo, parentNode) {
        var _this = _super.call(this, sideNav, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name, parentNode) || this;
        _this._functionsNode = _functionsNode;
        _this.functionInfo = functionInfo;
        _this.dashboardType = dashboard_type_1.DashboardType.function;
        _this.iconClass = "tree-node-svg-icon";
        _this.iconUrl = "images/function_f.svg";
        var disabledStr = _this.sideNav.translateService.instant(portal_resources_1.PortalResources.disabled).toLocaleLowerCase();
        _this._enabledTitle = _this.functionInfo.name;
        _this._disabledTitle = "(" + disabledStr + ") " + _this.functionInfo.name;
        return _this;
    }
    Object.defineProperty(FunctionNode.prototype, "title", {
        // This will be called on every change detection run. So I'm making sure to always
        // return the same exact object every time.
        get: function () {
            return this.functionInfo.config.disabled
                ? this._disabledTitle
                : this._enabledTitle;
        },
        enumerable: true,
        configurable: true
    });
    FunctionNode.prototype.handleSelection = function () {
        if (!this.disabled) {
            return this.parent.parent.initialize();
        }
        return Observable_1.Observable.of({});
    };
    FunctionNode.prototype.loadChildren = function () {
        this.children = [
            new FunctionIntegrateNode(this.sideNav, this.functionInfo, this),
            new FunctionManageNode(this.sideNav, this._functionsNode, this.functionInfo, this),
        ];
        if (!this.sideNav.configService.isStandalone()) {
            this.children.push(new FunctionMonitorNode(this.sideNav, this.functionInfo, this));
        }
        return Observable_1.Observable.of(null);
    };
    FunctionNode.prototype.getViewData = function () {
        return this.functionInfo;
    };
    FunctionNode.prototype.shouldBlockNavChange = function () {
        return FunctionNode.blockNavChangeHelper(this);
    };
    FunctionNode.prototype.dispose = function (newSelectedNode) {
        this.sideNav.broadcastService.clearAllDirtyStates();
        this.parent.dispose(newSelectedNode);
    };
    FunctionNode.blockNavChangeHelper = function (currentNode) {
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
    return FunctionNode;
}(tree_node_1.TreeNode));
exports.FunctionNode = FunctionNode;
var FunctionEditBaseNode = (function (_super) {
    __extends(FunctionEditBaseNode, _super);
    function FunctionEditBaseNode(sideNav, functionInfo, resourceId, parentNode) {
        var _this = _super.call(this, sideNav, resourceId, parentNode) || this;
        _this.functionInfo = functionInfo;
        _this.parentNode = parentNode;
        _this.showExpandIcon = false;
        return _this;
    }
    FunctionEditBaseNode.prototype.handleSelection = function () {
        if (!this.disabled) {
            return this.parent.parent.parent.initialize();
        }
        return Observable_1.Observable.of({});
    };
    FunctionEditBaseNode.prototype.getViewData = function () {
        return this.functionInfo;
    };
    FunctionEditBaseNode.prototype.shouldBlockNavChange = function () {
        return FunctionNode.blockNavChangeHelper(this);
    };
    FunctionEditBaseNode.prototype.dispose = function (newSelectedNode) {
        this.parentNode.dispose(newSelectedNode);
    };
    return FunctionEditBaseNode;
}(tree_node_1.TreeNode));
exports.FunctionEditBaseNode = FunctionEditBaseNode;
var FunctionIntegrateNode = (function (_super) {
    __extends(FunctionIntegrateNode, _super);
    function FunctionIntegrateNode(sideNav, functionInfo, parentNode) {
        var _this = _super.call(this, sideNav, functionInfo, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/integrate", parentNode) || this;
        _this.dashboardType = dashboard_type_1.DashboardType.functionIntegrate;
        _this.title = _this.sideNav.translateService.instant(portal_resources_1.PortalResources.tabNames_integrate);
        _this.iconClass = "fa fa-flash tree-node-function-edit-icon";
        return _this;
    }
    return FunctionIntegrateNode;
}(FunctionEditBaseNode));
exports.FunctionIntegrateNode = FunctionIntegrateNode;
var FunctionManageNode = (function (_super) {
    __extends(FunctionManageNode, _super);
    function FunctionManageNode(sideNav, _functionsNode, functionInfo, parentNode) {
        var _this = _super.call(this, sideNav, functionInfo, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/manage", parentNode) || this;
        _this._functionsNode = _functionsNode;
        _this.dashboardType = dashboard_type_1.DashboardType.functionManage;
        _this.title = _this.sideNav.translateService.instant(portal_resources_1.PortalResources.tabNames_manage);
        _this.iconClass = "fa fa-cog tree-node-function-edit-icon";
        return _this;
    }
    ;
    FunctionManageNode.prototype.remove = function () {
        this._functionsNode.removeChild(this.functionInfo, false);
        this.sideNav.cacheService.clearCachePrefix(function_app_1.FunctionApp.getMainUrl(this.sideNav.configService, this.functionInfo.functionApp.site));
        this.sideNav.cacheService.clearCachePrefix(function_app_1.FunctionApp.getScmUrl(this.sideNav.configService, this.functionInfo.functionApp.site));
    };
    return FunctionManageNode;
}(FunctionEditBaseNode));
exports.FunctionManageNode = FunctionManageNode;
var FunctionMonitorNode = (function (_super) {
    __extends(FunctionMonitorNode, _super);
    function FunctionMonitorNode(sideNav, functionInfo, parentNode) {
        var _this = _super.call(this, sideNav, functionInfo, functionInfo.functionApp.site.id + "/functions/" + functionInfo.name + "/monitor", parentNode) || this;
        _this.dashboardType = dashboard_type_1.DashboardType.functionMonitor;
        _this.title = _this.sideNav.translateService.instant(portal_resources_1.PortalResources.tabNames_monitor);
        _this.iconClass = "fa fa-search tree-node-function-edit-icon";
        return _this;
    }
    ;
    return FunctionMonitorNode;
}(FunctionEditBaseNode));
exports.FunctionMonitorNode = FunctionMonitorNode;
//# sourceMappingURL=function-node.js.map