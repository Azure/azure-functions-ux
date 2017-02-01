export class ApiProxy
{
    name: string;
    matchCondition: MatchCondition = new MatchCondition();
    backendUri: string;

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

    public static toJson(proxies: ApiProxy[]): string  {
        var cloneProxies: ApiProxy[] = JSON.parse(JSON.stringify(proxies)); // clone
        var result = {};

        // name
        cloneProxies.forEach((p) => {
            if (p.backendUri) {
                var name = p.name;
                delete p.name;
                result[name] = p;

                if ((!p.matchCondition.methods) || (p.matchCondition.methods.length === 0)) {
                    delete p.matchCondition.methods;
                }
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