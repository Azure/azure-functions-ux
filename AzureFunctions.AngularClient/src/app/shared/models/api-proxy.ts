import {TranslateService } from '@ngx-translate/core';
import {PortalResources} from './portal-resources';
import {FunctionApp} from '../function-app';

export class ApiProxy {
    name: string;
    matchCondition: MatchCondition = new MatchCondition();
    backendUri: string;

    functionApp: FunctionApp;

    public static fromJson(obj: any): ApiProxy[] {
        var result: ApiProxy[] = [];

        var proxies = obj.proxies;

        for (var property in proxies) {
            if (proxies.hasOwnProperty(property)) {
                var proxy = <ApiProxy>proxies[property];
                proxy.name = property;
                result.push(proxy);
            }
        }

        return result;
    }

    public static toJson(proxies: ApiProxy[], ts: TranslateService): string {


        var cloneProxies: ApiProxy[] = JSON.parse(JSON.stringify(proxies, ApiProxy.replacer)); // clone
        var saveProxies: ApiProxy[] = []; // for ordering properties in stringify
        var result = {};

        cloneProxies.forEach((p) => {
            if (p.name !== ts.instant(PortalResources.sidebar_newApiProxy)) {
                var name = p.name;
                delete p.name;

                if ((!p.matchCondition.methods) || (p.matchCondition.methods.length === 0)) {
                    delete p.matchCondition.methods;
                }

                result[name] = {};   // matchCondition and backendUri should be always on top
                result[name].matchCondition = p.matchCondition;
                if (p.backendUri) {
                    result[name].backendUri = p.backendUri;
                }
                for (var prop in p) { // custom properties
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
    }

    private static replacer(key, value) {
        if (key === 'functionApp') {
            return undefined;
        }
        return value;
    }

}

export class MatchCondition {
    methods: string[];
    route: string;
}