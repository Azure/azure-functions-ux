import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from './portal-resources';

export class ApiProxy {
    name: string;
    matchCondition: MatchCondition = new MatchCondition();
    backendUri: string;
    requestOverrides?: any;
    responseOverrides?: any;

    public static fromJson(obj: any): ApiProxy[] {
        const result: ApiProxy[] = [];

        const proxies = obj.proxies;

        for (const property in proxies) {
            if (proxies.hasOwnProperty(property)) {
                const proxy = <ApiProxy>proxies[property];
                proxy.name = property;
                result.push(proxy);
            }
        }

        return result;
    }

    public static toJson(proxies: ApiProxy[], ts: TranslateService): string {


        const cloneProxies: ApiProxy[] = JSON.parse(JSON.stringify(proxies, ApiProxy.replacer)); // clone
        const result = {};

        cloneProxies.forEach((p) => {
            if (p.name !== ts.instant(PortalResources.sidebar_newApiProxy)) {
                const name = p.name;
                delete p.name;

                if ((!p.matchCondition.methods) || (p.matchCondition.methods.length === 0)) {
                    delete p.matchCondition.methods;
                }

                result[name] = {};   // matchCondition and backendUri should be always on top
                result[name].matchCondition = p.matchCondition;
                if (p.backendUri) {
                    result[name].backendUri = p.backendUri;
                }
                for (const prop in p) { // custom properties
                    if (prop !== 'matchCondition' && prop !== 'backendUri') {
                        result[name][prop] = p[prop];
                    }
                }
            }
        });


        return JSON.stringify({
            '$schema': 'http://json.schemastore.org/proxies',
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
