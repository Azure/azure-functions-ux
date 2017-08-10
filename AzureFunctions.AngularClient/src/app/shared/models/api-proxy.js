"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var portal_resources_1 = require("./portal-resources");
var ApiProxy = (function () {
    function ApiProxy() {
        this.matchCondition = new MatchCondition();
    }
    ApiProxy.fromJson = function (obj) {
        var result = [];
        var proxies = obj.proxies;
        for (var property in proxies) {
            if (proxies.hasOwnProperty(property)) {
                var proxy = proxies[property];
                proxy.name = property;
                result.push(proxy);
            }
        }
        return result;
    };
    ApiProxy.toJson = function (proxies, ts) {
        var cloneProxies = JSON.parse(JSON.stringify(proxies, ApiProxy.replacer)); // clone
        var saveProxies = []; // for ordering properties in stringify
        var result = {};
        cloneProxies.forEach(function (p) {
            if (p.name !== ts.instant(portal_resources_1.PortalResources.sidebar_newApiProxy)) {
                var name = p.name;
                delete p.name;
                if ((!p.matchCondition.methods) || (p.matchCondition.methods.length === 0)) {
                    delete p.matchCondition.methods;
                }
                result[name] = {}; // matchCondition and backendUri should be always on top
                result[name].matchCondition = p.matchCondition;
                if (p.backendUri) {
                    result[name].backendUri = p.backendUri;
                }
                for (var prop in p) {
                    if (prop !== "matchCondition" && prop !== "backendUri") {
                        result[name][prop] = p[prop];
                    }
                }
            }
        });
        return JSON.stringify({
            "$schema": "http://json.schemastore.org/proxies",
            proxies: result
        }, null, 4);
    };
    ApiProxy.replacer = function (key, value) {
        if (key === 'functionApp') {
            return undefined;
        }
        return value;
    };
    return ApiProxy;
}());
exports.ApiProxy = ApiProxy;
var MatchCondition = (function () {
    function MatchCondition() {
    }
    return MatchCondition;
}());
exports.MatchCondition = MatchCondition;
//# sourceMappingURL=api-proxy.js.map