import {Injectable, EventEmitter} from '@angular/core';
import {Http, Headers, Response, Request} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';

import { Guid } from './../Utilities/Guid';
import {Subscription} from '../models/subscription';
import {FunctionContainer} from '../models/function-container';
import {StorageAccount} from '../models/storage-account';
import {ResourceGroup} from '../models/resource-group';
import {UserService} from './user.service';
import {Constants} from '../models/constants';
import {ClearCache} from '../decorators/cache.decorator';
import {AiService} from './ai.service';
import {PortalResources} from '../models/portal-resources';
import {ArmObj, ArmArrayResult} from '../models/arm/arm-obj';
import {ConfigService} from './config.service';

// export interface IArmService{

//     get(resourceId : string, apiVersion? : string);

//     delete(resourceId : string, apiVersion? : string);

//     put(resourceId : string, body : any, apiVersion? : string);

//     post(resourceId : string, body : any, apiVersion? : string);

//     send(method : string, url : string, body? : any, etag? : string, headers? : Headers);

// }

@Injectable()
export class ArmService {
    public subscriptions = new ReplaySubject<Subscription[]>(1);
    public armUrl = '';

    private token: string;
    private sessionId : string;
    public armApiVersion = '2014-04-01'
    public armPermissionsVersion = '2015-07-01';
    public armLocksApiVersion = '2015-01-01';
    public storageApiVersion = '2015-05-01-preview';
    public websiteApiVersion = '2015-08-01';
    public static availabilityApiVersion = '2015-01-01';

    private _initialized = false;
    private _invokeId = 100;

    constructor(private _http: Http,
        private _configService: ConfigService,
        private _userService: UserService,
        protected _aiService: AiService,
        private _translateService: TranslateService) {

        this.armUrl = this._configService.getAzureResourceManagerEndpoint();

        //Cant Get Angular to accept GlobalStateService as input param
        if ( !window.location.pathname.endsWith('/try')) {
            _userService.getStartupInfo().mergeMap(info => {
                this.token = info.token;
                this.sessionId = info.sessionId;
                if(info.subscriptions && info.subscriptions.length > 0){
                    return Observable.of(info.subscriptions);
                }
                else{
                    return this.getSubscriptions();
                }
            })
            .subscribe(subs => {
                if(!this._initialized){
                    this.subscriptions.next(subs);
                }

                this._initialized = true;
            });
        }
    }

    private getSubscriptions() {
        var url = `${this.armUrl}/subscriptions?api-version=2014-04-01`;
        return this._http.get(url, { headers: this._getHeaders() })
        .map(r => <Subscription[]>(r.json().value));
    }

    send(method : string, url : string, body? : any, etag? : string, headers? : Headers, invokeApi? : boolean){

        headers = headers ? headers : this._getHeaders(etag);

        if(invokeApi){
            let pathAndQuery = url.slice(this.armUrl.length);
            pathAndQuery = encodeURI(pathAndQuery);
            headers.append('x-ms-path-query', pathAndQuery);
            url = `${this.armUrl}/api/invoke?_=${this._invokeId++}`;
        }

        let request = new Request({
            url : url,
            method : method,
            search : null,
            headers :  headers,
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
        headers.append('x-ms-client-request-id', Guid.newGuid());

        if(this.sessionId){
            headers.append('x-ms-client-session-id', this.sessionId);
        }

        if(etag){
            headers.append('If-None-Match', etag);
        }

        return headers;
    }
}
