import { SiteDescriptor } from './../resourceDescriptors';
import { FunctionApp } from './../function-app';
import { Guid } from './../Utilities/Guid';
import {Http, Headers, Response, Request} from '@angular/http';
import {Injectable, EventEmitter} from '@angular/core';
import {Subscription} from '../models/subscription';
import {FunctionContainer} from '../models/function-container';
import {Observable, Subscription as RxSubscription, Subject, ReplaySubject} from 'rxjs/Rx';
import {StorageAccount} from '../models/storage-account';
import {ResourceGroup} from '../models/resource-group';
import {UserService} from './user.service';
import {Constants} from '../models/constants';
import {ClearCache} from '../decorators/cache.decorator';
import {AiService} from './ai.service';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
import {PortalResources} from '../models/portal-resources';
import {ArmObj, ArmArrayResult} from '../models/arm/arm-obj';
import {ConfigService} from './config.service';

// export interface IArmService{

//     get(resourceId: string, apiVersion?: string);

//     delete(resourceId: string, apiVersion?: string);

//     put(resourceId: string, body: any, apiVersion?: string);

//     post(resourceId: string, body: any, apiVersion?: string);

//     send(method: string, url: string, body?: any, etag?: string, headers?: Headers);

// }

@Injectable()

export class ArmServiceBase {
    public static availabilityApiVersion = '2015-01-01';
    public subscriptions = new ReplaySubject<Subscription[]>(1);
    public armUrl = '';

    private token: string;
    private sessionId: string;
    public armApiVersion = '2014-04-01';
    public armPermissionsVersion = '2015-07-01';
    public armLocksApiVersion = '2015-01-01';
    public storageApiVersion = '2015-05-01-preview';
    public websiteApiVersion = '2015-08-01';

    private _initialized = false;
    private _invokeId = 100;

    constructor(private _http: Http,
        protected _configService: ConfigService,
        private _userService: UserService,
        protected _aiService: AiService,
        private _translateService: TranslateService) {

        this.armUrl = this._configService.getAzureResourceManagerEndpoint();

        // Cant Get Angular to accept GlobalStateService as input param
        if ( !window.location.pathname.endsWith('/try')) {
            _userService.getStartupInfo().flatMap(info => {
                this.token = info.token;
                this.sessionId = info.sessionId;
                if (info.subscriptions && info.subscriptions.length > 0) {
                    return Observable.of(info.subscriptions);
                } else {
                    return this.getSubscriptions();
                }
            })
            .subscribe(subs => {
                if (!this._initialized) {
                    this.subscriptions.next(subs);
                }

                this._initialized = true;
            });
        }
    }

    private getSubscriptions() {
        const url = `${this.armUrl}/subscriptions?api-version=2014-04-01`;
        return this._http.get(url, { headers: this._getHeaders() })
        .map(r => <Subscription[]>(r.json().value));
    }

    send(method: string, url: string, body?: any, etag?: string, headers?: Headers, invokeApi?: boolean) {

        headers = headers ? headers : this._getHeaders(etag);

        if (invokeApi) {
            let pathAndQuery = url.slice(this.armUrl.length);
            pathAndQuery = encodeURI(pathAndQuery);
            headers.append('x-ms-path-query', pathAndQuery);
            url = `${this.armUrl}/api/invoke?_=${this._invokeId++}`;
        }

        const request = new Request({
            url: url,
            method: method,
            search: null,
            headers:  headers,
            body: body ? body : null

        });

        return this._http.request(request);
    }

    get(resourceId: string, apiVersion?: string) {
        const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.get(url, {headers: this._getHeaders()});
    }

    delete(resourceId: string, apiVersion?: string) {
        const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.delete(url, {headers: this._getHeaders()});
    }

    put(resourceId: string, body: any, apiVersion?: string) {
        const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.put(url, JSON.stringify(body), {headers: this._getHeaders()});
    }

    post(resourceId: string, body: any, apiVersion?: string) {
        const content = !!body ? JSON.stringify(body) : null;
        const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.post(url, content, {headers: this._getHeaders()});
    }

    private _getHeaders(etag?: string): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Bearer ${this.token}`);
        headers.append('x-ms-client-request-id', Guid.newGuid());

        if (this.sessionId) {
            headers.append('x-ms-client-session-id', this.sessionId);
        }

        if (etag) {
            headers.append('If-None-Match', etag);
        }

        return headers;
    }
}


@Injectable()
export class ArmService extends ArmServiceBase {

    private _tryMode = window.location.pathname.toLowerCase() === '/try';
    private _tryFunctionApp : FunctionApp;

    private _whiteListedPrefixUrls : string[] = [
            `${Constants.serviceHost}api`
        ];;

    constructor(http: Http,
        configService: ConfigService,
        userService: UserService,
        aiService: AiService,
        translateService: TranslateService) {

        super(http, configService, userService, aiService, translateService);
    }

    public set tryFunctionApp(tryFunctionApp : FunctionApp){
        this._tryFunctionApp = tryFunctionApp;
        this._whiteListedPrefixUrls.push(`${tryFunctionApp.getScmUrl()}/api`);
        this._whiteListedPrefixUrls.push(`${tryFunctionApp.getMainSiteUrl()}`);

        let descriptor = new SiteDescriptor(tryFunctionApp.site.id);
        this.subscriptions.next([{
            subscriptionId : descriptor.subscription,
            displayName : "Trial Subscription",
            state: "Enabled"
        }])
    }

    public get tryFunctionApp(){
        return this._tryFunctionApp;
    }

    get(resourceId : string, apiVersion? : string) : Observable<Response>{
        if(!this._tryMode){
            return super.get(resourceId, apiVersion);
        }
        
        this._aiService.trackEvent("/try/arm-get-failure", {
            uri : resourceId
        });

        throw "[ArmTryService] - get: " + resourceId;
    }

    delete(resourceId : string, apiVersion? : string) : Observable<Response>{
        if(!this._tryMode){
            return super.delete(resourceId, apiVersion);
        }

        this._aiService.trackEvent("/try/arm-delete-failure", {
            uri : resourceId
        });

        throw "[ArmTryService] - delete: " + resourceId;
    }

    put(resourceId : string, body : any, apiVersion? : string) : Observable<Response>{
        if(!this._tryMode){
            return super.put(resourceId, body, apiVersion);
        }        
        this._aiService.trackEvent("/try/arm-put-failure", {
            uri : resourceId
        });

        throw "[ArmTryService] - put: " + resourceId;
    }

    post(resourceId : string, body : any, apiVersion? : string) : Observable<Response>{
        if(!this._tryMode){
            return super.post(resourceId, body, apiVersion);
        }        
        
        this._aiService.trackEvent("/try/arm-post-failure", {
            uri : resourceId
        });

        throw "[ArmTryService] - post: " + resourceId;
    }

    send(method : string, url : string, body? : any, etag? : string, headers? : Headers, invokeApi? : boolean) : Observable<Response>{
        if(!this._tryMode){
            return super.send(method, url, body, etag, headers, invokeApi);
        }        
        
        let urlNoQuery = url.toLowerCase().split('?')[0];

        if(this._whiteListedPrefixUrls.find(u => urlNoQuery.startsWith(u.toLowerCase()))){
            return super.send(method, url, body, etag, headers);
        }
        else if(urlNoQuery.endsWith(this.tryFunctionApp.site.id.toLowerCase())){
            return Observable.of(this._getFakeResponse(this.tryFunctionApp.site));
        }
        else if(urlNoQuery.endsWith("/providers/microsoft.authorization/permissions")){
            return Observable.of(this._getFakeResponse({
                "value" : [{
                    "actions" : ["*"],
                    "notActions": []
                }],
                "nextLink":null
            }));
        }
        else if(urlNoQuery.endsWith("/providers/microsoft.authorization/locks")){
            return Observable.of(this._getFakeResponse({"value":[]}));
        }
        else if(urlNoQuery.endsWith("/config/web")){
            return Observable.of(<any>this._getFakeResponse({
                id : this._tryFunctionApp.site.id,
                properties : {
                    scmType : "None"
                }
            }));
        }
        else if(urlNoQuery.endsWith("/appsettings/list")){
            return this.tryFunctionApp.getFunctionContainerAppSettings()
            .map(r =>{
                return this._getFakeResponse({
                    properties: r
                })
            })
        }

        this._aiService.trackEvent("/try/arm-send-failure", {
            uri : url
        });

        throw "[ArmTryService] - send: " + url;
    }

    private _getFakeResponse(jsonObj : any) : any{
        return {
            headers : {
                get : (name : string) =>{
                    return null;
                }
            },
            json : () =>{
                return jsonObj;
            }
        }
    }
}