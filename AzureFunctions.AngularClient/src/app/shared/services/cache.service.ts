import {Injectable, EventEmitter} from '@angular/core';
import {ArmService} from './arm.service';
import {Observable, Subscription as RxSubscription, Subject, ReplaySubject} from 'rxjs/Rx';
import {Http, Headers, Response} from '@angular/http';

export interface CacheItem{
    id : string,
    value : any,
    expireTime : number,
    etag : string,
    responseObservable : Observable<any>
}

export class Cache{
    [key : string] : CacheItem;
}

@Injectable()
export class CacheService {
    private _cache : Cache;
    private _expireMS = 70000;
    private _cleanUpMS = 3 * this._expireMS;
    public cleanUpEnabled = true;

    constructor(private _armService : ArmService){
        this._cache = new Cache();

        setTimeout(this._cleanUp.bind(this), this._cleanUpMS);
    }

    getArmResource(resourceId : string, force? : boolean, apiVersion? : string){
        let url = this._getArmUrl(resourceId, apiVersion);
        return this.send(url, "GET", false, force);
    }

    getArmResourceWithQueryString(resourceId : string, queryString : string, force? : boolean){
        let url = this._getArmUrlWithQueryString(resourceId, queryString);
        return this.send(url, "GET", false, force);
    }

    getArmResources(resourceId : string, force? : boolean, apiVersion? : string){
        let url = this._getArmUrl(resourceId, apiVersion);
        return this.send(url, "GET", true, force);
    }

    postArmResource(resourceId : string, force? : boolean, apiVersion? : string){
        let url = this._getArmUrl(resourceId, apiVersion);
        return this.send(url, "POST", false, force);
    }

    get(url : string, force? : boolean, headers? : Headers){
        return this.send(url, "GET", false, force);
    }

    private _cleanUp(){
        if(!this.cleanUpEnabled){
            return;
        }

        for(let key in this._cache){
            if(this._cache.hasOwnProperty(key)){
                let item = this._cache[key];
                if(Date.now() >= item.expireTime){
                    delete this._cache[key];
                }
            }
        }

        setTimeout(this._cleanUp.bind(this), this._cleanUpMS);
    }

    public send(
        url : string,
        method : string,
        isArmCollection : boolean,
        force : boolean,
        headers? : Headers) {

        let key = url.toLowerCase();

        // Grab a reference before any async calls in case the item gets cleaned up
        let item = this._cache[key];

        if(item && item.responseObservable){

            // There's currently a request in flight.  I think it makes sense for
            // "force" not to matter here because 1, you're already updating the
            // data, and 2, you may have 2 requests in flight which could end
            // up in a race
            return item.responseObservable;
        }
        else if(!force && item && Date.now() < item.expireTime){
            return Observable.of(this._clone(item.value));
        }
        else{

            let etag = item && item.etag;

            if(etag && headers){
                headers.append('If-None-Match', etag);
            }

            let responseObs = this._armService.send(method, url, null, etag, headers)
            .map(response =>{
                return this.mapAndCacheResponse(response, key, isArmCollection);
            })
            .share()
            .catch(error =>{
                if(error.status === 304){
                    this._cache[key] = this.createCacheItem(
                        key,
                        item.value,
                        error.headers.get("ETag"),
                        null);

                    return Observable.of(this._clone(item.value));
                }
                else{
                    return Observable.throw(error);
                }
            });

            this._cache[key] = this.createCacheItem(
                key,
                item && item.value,
                etag,
                responseObs);

            return responseObs;
        }
    }

    public mapAndCacheResponse(response : Response, key : string, isArmCollection : boolean){
        let responseETag = response.headers.get("ETag");
        let value = null;
        if(isArmCollection){
            value = response.json().value;
        }
        else{
            value = response.json();
        }

        this._cache[key] = this.createCacheItem(key, value, responseETag, null);
        return this._clone(value);
    }

    private _clone(obj : any){
        return JSON.parse(JSON.stringify(obj));
    }

    public createCacheItem(
        id : string,
        value : any,
        etag : string,
        responseObs : Observable<Response>){

        return {
            id : id,
            value : value,
            expireTime : Date.now() + this._expireMS,
            etag : etag,
            responseObservable : responseObs
        };
    }

    private _getArmUrl(resourceId : string, apiVersion? : string){
        let url = `${this._armService.armUrl}${resourceId}`;
        return this._updateQueryString(
            url,
            "api-version",
            apiVersion ? apiVersion : this._armService.websiteApiVersion);
    }

    private _getArmUrlWithQueryString(resourceId : string, queryString : string){
        return `${this._armService.armUrl}${resourceId}?${queryString}`;
    }

    // http://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
    private _updateQueryString(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    }
}