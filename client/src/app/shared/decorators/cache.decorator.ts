import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';

import { FunctionInfo } from '../models/function-info';

let cachedData: { [key: string]: { date?: Date, observable: Observable<any>, data?: any } } = {};
/**
 * Caches the returned Observable.
 * The cache key used is either a property with the name ${propertyKey} from the first arg to the function.
 * If propertyKey isn't specified or not there, then if the first arg is string, it's used as the key
 * else we stringify the whole object.
 *
 * If there are no args passed to the function, then the function name is the key.
 */
export function Cache(propertyKey?: string, arg?: number) {
    return (_: Object, functionName: string, descriptor: TypedPropertyDescriptor<any>) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const key = getCacheKey(functionName, propertyKey, args, arg || 0);
            let cache = cachedData[key];
            // Special case getTemplates() for testing templates
            try {
                if (window.localStorage &&
                    ((functionName === 'getTemplates' && window.localStorage.getItem('dev-templates')) ||
                        (functionName === 'getBindingConfig' && window.localStorage.getItem('dev-bindings')))) {
                    return originalMethod.apply(this, args);
                }
            } catch (e) {
                console.log(e);
            }

            if (cache && cache.data) {
                return Observable.of(cache.data);
            } else if (cache && cache.observable) {
                return cache.observable;
            } else {
                cache = {
                    observable: originalMethod.apply(this, args)
                        .map(r => {
                            delete cache.observable;
                            cache.data = r;
                            return cache.data;
                        })
                        .do(null, () => {
                            delete cachedData[key];
                        })
                        .share()
                };
                cachedData[key] = cache;
                return cache.observable;
            }
        };
        return descriptor;
    };
}

/**
 * This function clears the cache by @Cache based on the same key and functionName logic.
 * This function requires the name of the function that would have generated the cache that needs to be cleared.
 * Also if the function called is 'clearAllCachedData()' then all data is cleared.
 */
export function ClearCache(functionName: string, propertyKey?: string, arg?: number) {
    return (_: Object, __: string, descriptor: TypedPropertyDescriptor<any>) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            if (functionName === 'clearAllCachedData') {
                cachedData = {};
            } else if (functionName === 'clearAllFunction' && propertyKey) {
                for (const key in cachedData) {
                    if (key.startsWith(propertyKey + '+')) {
                        delete cachedData[key];
                    }
                }
            } else {
                const key = getCacheKey(functionName, propertyKey, args, arg || 0);
                delete cachedData[key];
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}

export function ClearAllFunctionCache(functionInfo: FunctionInfo) {
    for (const e in cachedData) {
        if (cachedData.hasOwnProperty(e)) {
            const normalizedKey = e.toLocaleLowerCase();
            const normalizedFunctionName = functionInfo.name.toLocaleLowerCase();
            if (normalizedKey.indexOf(`/${normalizedFunctionName}/`) !== -1 ||
                normalizedKey.endsWith(normalizedFunctionName) ||
                normalizedKey.indexOf(`/${normalizedFunctionName}.`) !== -1) {
                delete cachedData[e];
            }
        }
    }
}

function getCacheKey(functionName: string, propertyName: string, args: any[], arg: number): string {
    let key = `${functionName}+`;
    if (propertyName && args && args.length >= arg && args[arg][propertyName]) {
        key += args[arg][propertyName];
    } else if (args && args.length >= arg && typeof args[arg] === 'string') {
        key += args[arg];
    } else if (args && args.length > 1) {
        key += JSON.stringify(args);
    }
    return key;
}
