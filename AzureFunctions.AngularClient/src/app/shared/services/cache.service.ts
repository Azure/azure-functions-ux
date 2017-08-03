import { Injectable } from '@angular/core';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import { ArmService } from './arm.service';
import { ClearCache } from '../decorators/cache.decorator';
import { Url } from './../../shared/Utilities/url';

export interface CacheItem {
    id: string;
    value: any;
    expireTime: number;
    etag: string;
    responseObservable: Observable<any>;
    isRawResponse: boolean;   // Used to represent whether the cached object is a raw response, or an optimized JSON object that needs cloning
}

export class Cache {
    [key: string]: CacheItem;
}

@Injectable()
export class CacheService {
    private _cache: Cache;
    private _expireMS = parseInt(Url.getParameterByName(window.location.href, 'appsvc.debug.cacheinterval'), 10) || 60000;
    private _cleanUpMS = 3 * this._expireMS;
    public cleanUpEnabled = true;

    constructor(private _armService: ArmService) {
        this._cache = new Cache();

        setTimeout(this._cleanUp.bind(this), this._cleanUpMS);
    }

    getArm(resourceId: string, force?: boolean, apiVersion?: string, invokeApi?: boolean): Observable<Response> {
        const url = this._getArmUrl(resourceId, apiVersion);
        return this._send(url, 'GET', force, null, null, invokeApi);
    }

    postArm(resourceId: string, force?: boolean, apiVersion?: string): Observable<Response> {
        const url = this._getArmUrl(resourceId, apiVersion);
        return this._send(url, 'POST', force);
    }

    putArm(resourceId: string, apiVersion?: string, content?: any) {
        const url: string = this._getArmUrl(resourceId, apiVersion);
        delete this._cache[url.toLowerCase()];
        return this._armService.send('PUT', url, content);
    }

    get(url: string, force?: boolean, headers?: Headers, invokeApi?: boolean) {
        return this._send(url, 'GET', force, headers, null, invokeApi);
    }

    post(url: string, force?: boolean, headers?: Headers, content?: any) {
        return this._send(url, 'POST', force, headers, content);
    }

    put(url: string, force?: boolean, headers?: Headers, content?: any) {
        return this._send(url, 'PUT', force, headers, content);
    }

    patch(url: string, force?: boolean, headers?: Headers, content?: any) {
        return this._send(url, "PATCH", force, headers, content);
    }

    @ClearCache('clearAllCachedData')
    clearCache() {
        this._cache = new Cache();
    }

    clearArmIdCachePrefix(armIdPrefix: string) {
        const prefix = `${this._armService.armUrl}${armIdPrefix}`;
        this.clearCachePrefix(prefix);
    }

    clearCachePrefix(prefix: string) {
        prefix = prefix.toLowerCase();

        for (const key in this._cache) {
            if (key.startsWith(prefix) && this._cache.hasOwnProperty(key)) {
                delete this._cache[key];
            }
        }
    }

    // searchArm(term : string, subs: Subscription[], nextLink : string){
    //     let url : string;
    //     if(nextLink){
    //         url = nextLink;
    //     }
    //     else{
    //         url = `${this._armService.armUrl}/resources?api-version=${this._armService.armApiVersion}&$filter=(`;

    //         for(let i = 0; i < subs.length; i++){
    //             url += `subscriptionId eq '${subs[i].subscriptionId}'`;
    //             if(i < subs.length - 1){
    //                 url += ` or `;
    //             }
    //         }

    //         url += `) and (substringof('${term}', name)) and (resourceType eq 'microsoft.web/sites')`;
    //     }

    //     return this.get(url).map<ArmArrayResult<any>>(r => r.json());
    // }

    private _cleanUp() {
        if (!this.cleanUpEnabled) {
            return;
        }

        for (const key in this._cache) {
            if (this._cache.hasOwnProperty(key)) {
                const item = this._cache[key];
                if (Date.now() >= item.expireTime) {
                    delete this._cache[key];
                }
            }
        }

        setTimeout(this._cleanUp.bind(this), this._cleanUpMS);
    }

    public _send(
        url: string,
        method: string,
        force: boolean,
        headers?: Headers,
        content?: any,
        invokeApi?: boolean) {

        const key = url.toLowerCase();

        // Grab a reference before any async calls in case the item gets cleaned up
        const item = this._cache[key];

        if (item && item.responseObservable) {

            // There's currently a request in flight.  I think it makes sense for
            // "force" not to matter here because 1, you're already updating the
            // data, and 2, you may have 2 requests in flight which could end
            // up in a race
            return item.responseObservable;
        } else if (!force && item && Date.now() < item.expireTime) {
            return Observable.of(item.isRawResponse ? item.value : this._clone(item.value));
        } else {

            const etag = item && item.etag;

            if (etag && headers) {
                headers.append('If-None-Match', etag);
            }

            const responseObs = this._armService.send(method, url, content, etag, headers, invokeApi)
                .map(response => {
                    return this._mapAndCacheResponse(response, key);
                })
                .share()
                .catch(error => {
                    if (error.status === 304) {
                        this._cache[key] = this.createCacheItem(
                            key,
                            item.value,  // We're assuming that if we have a 304, that item will not be null
                            error.headers.get('ETag'),
                            null,
                            item.isRawResponse);

                        return Observable.of(item.isRawResponse ? item.value : this._clone(item.value));
                    } else {
                        return Observable.throw(error);
                    }
                });

            this._cache[key] = this.createCacheItem(
                key,
                item && item.value,
                etag,
                responseObs,
                false);

            return responseObs;
        }
    }

    public _mapAndCacheResponse(response: Response, key: string) {
        const responseETag = response.headers.get('ETag');
        this._cache[key] = this.createCacheItem(key, response, responseETag, null, true);
        return response;
    }

    private _clone(obj: any) {
        return JSON.parse(JSON.stringify(obj));
    }

    public createCacheItem(
        id: string,
        value: any,
        etag: string,
        responseObs: Observable<Response>,
        isRawResponse: boolean): CacheItem {

        return {
            id: id,
            value: value,
            expireTime: Date.now() + this._expireMS,
            etag: etag,
            responseObservable: responseObs,
            isRawResponse: isRawResponse
        };
    }

    private _getArmUrl(resourceId: string, apiVersion?: string) {
        const url = `${this._armService.armUrl}${resourceId}`;
        return this._updateQueryString(
            url,
            'api-version',
            apiVersion ? apiVersion : this._armService.websiteApiVersion);
    }

    // private _getArmUrlWithQueryString(resourceId : string, queryString : string){
    //     if(queryString.startsWith("?")){
    //         return `${this._armService.armUrl}${resourceId}${queryString}`;
    //     }
    //     else{
    //         return `${this._armService.armUrl}${resourceId}?${queryString}`;
    //     }
    // }

    // http://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
    private _updateQueryString(uri, key, value) {
        const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
        const separator = uri.indexOf('?') !== -1 ? '&' : '?';
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + '=' + value + '$2');
        } else {
            return uri + separator + key + '=' + value;
        }
    }
}
