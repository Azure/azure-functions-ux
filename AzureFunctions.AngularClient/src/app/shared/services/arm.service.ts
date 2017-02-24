import {Http, Headers, Response, Request} from '@angular/http';
import {Injectable, EventEmitter} from '@angular/core';
import {Subscription} from '../models/subscription';
import {FunctionContainer} from '../models/function-container';
import {Observable, Subscription as RxSubscription, Subject, ReplaySubject} from 'rxjs/Rx';
import {StorageAccount} from '../models/storage-account';
import {ResourceGroup} from '../models/resource-group';
import {UserService} from './user.service';
import {PublishingCredentials} from '../models/publishing-credentials';
import {Constants} from '../models/constants';
import {ClearCache} from '../decorators/cache.decorator';
import {AiService} from './ai.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {ArmObj, ArmArrayResult} from '../models/arm/arm-obj';

@Injectable()
export class ArmService {
    public subscriptions = new ReplaySubject<Subscription[]>(1);
    public armUrl = 'https://management.azure.com';

    private token: string;
    public armApiVersion = '2014-04-01'
    public armLocksApiVersion = '2015-01-01';
    public storageApiVersion = '2015-05-01-preview';
    public websiteApiVersion = '2015-08-01';

    constructor(private _http: Http,
        private _userService: UserService,
        private _aiService: AiService,
        private _translateService: TranslateService) {
        //Cant Get Angular to accept GlobalStateService as input param
        if ( !window.location.pathname.endsWith('/try')) {
            _userService.getStartupInfo().flatMap(info => {
                this.token = info.token;
                if(info.subscriptions && info.subscriptions.length > 0){
                    return Observable.of(info.subscriptions);
                }
                else{
                    return this.getSubscriptions();
                }
            })
            .subscribe(subs => this.subscriptions.next(subs));
        }
    }

    private getSubscriptions() {
        var url = `${this.armUrl}/subscriptions?api-version=2014-04-01`;
        return this._http.get(url, { headers: this._getHeaders() })
        .map<Subscription[]>(r => r.json().value);
    }

    send(method : string, url : string, body? : any, etag? : string, headers? : Headers){
        let request = new Request({
            url : url,
            method : method,
            search : null,
            headers :  headers ? headers : this._getHeaders(etag),
            body : body ? body : null
        });

        return this._http.request(request);
    }

    get(resourceId : string, apiVersion? : string){
        var url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.get(url, {headers : this._getHeaders()});
    }

    delete(resourceId : string, apiVersion? : string){
        var url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.delete(url, {headers : this._getHeaders()});
    }

    put(resourceId : string, body : any, apiVersion? : string){
        var url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.put(url, JSON.stringify(body), {headers : this._getHeaders()});
    }

    post(resourceId : string, body : any, apiVersion? : string){
        let content = !!body ? JSON.stringify(body) : null;
        var url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.post(url, content, {headers : this._getHeaders()});
    }

    private _getHeaders(etag?: string): Headers {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Bearer ${this.token}`);

        if(etag){
            headers.append('If-None-Match', etag);
        }

        return headers;
    }

//////////////////////////////
// TODO: Remove the methods below from this service
/////////////////////////////

    getConfig(resourceId : string) {
        var url = `${this.armUrl}${resourceId}/config/web?api-version=${this.websiteApiVersion}`;
        return this._http.get(url, { headers: this._getHeaders() })
            .map<{ [key: string]: string }>(r => r.json().properties);
    }



}