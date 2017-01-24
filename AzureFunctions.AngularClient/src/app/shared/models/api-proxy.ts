export class ApiProxy
{
    name: string;
    matchCondition: MatchCondition = new MatchCondition();
    backendUri: string;

    public static fromJson(obj: any): ApiProxy[] {
        var result: ApiProxy[] = [];

        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                var proxy = <ApiProxy>obj[property];
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
            var name = p.name;
            delete p.name;
            result[name] = p;
        });

        return JSON.stringify(result);
    }
}

export class MatchCondition {
    methods: string[];
    route: string;
}

export class Methods {
    get: boolean = true;
    post: boolean = true;
    delete: boolean = true;
    head: boolean = true;
    patch: boolean = true;
    put: boolean = true;
    options: boolean = true;
    trace: boolean = true;
}
