import {TranslateService } from 'ng2-translate/ng2-translate';
import {PortalResources} from './portal-resources';
import {FunctionApp} from '../function-app';

export class ApiProxy
{
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

    public static toJson(proxies: ApiProxy[], ts: TranslateService): string  {


        var cloneProxies: ApiProxy[] = JSON.parse(JSON.stringify(proxies, ['name', 'matchCondition', 'backendUri', 'methods', 'route'] )); // clone
        var saveProxies: ApiProxy[] = []; // for ordering properties in stringify
        var result = {};

        // name
        cloneProxies.forEach((p) => {
            if (p.name !== ts.instant(PortalResources.sidebar_newApiProxy)) {
                var name = p.name;
                delete p.name;
                //result[name] = p;

                if ((!p.matchCondition.methods) || (p.matchCondition.methods.length === 0)) {
                    delete p.matchCondition.methods;
                }

                result[name] = {};
                result[name].matchCondition = p.matchCondition;
                result[name].backendUri = p.backendUri;
            }
        });


        return JSON.stringify({
            proxies: result
        }, null, 4);
    }
}

export class MatchCondition {
    methods: string[];
    route: string;
}