import { ArmServiceHelper } from './arm.service-helper';
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

//     get(resourceId: string, apiVersion?: string);

//     delete(resourceId: string, apiVersion?: string);

//     put(resourceId: string, body: any, apiVersion?: string);

//     post(resourceId: string, body: any, apiVersion?: string);

//     send(method: string, url: string, body?: any, etag?: string, headers?: Headers);

// }

@Injectable()
export class ArmService {
  public static availabilityApiVersion = '2015-01-01';

    public armUrl = '';
    public armApiVersion = '2014-04-01';
    public armPermissionsVersion = '2015-07-01';
    public armLocksApiVersion = '2015-01-01';
    public storageApiVersion = '2015-05-01-preview';
    public websiteApiVersion = '2015-08-01';

    private _token: string;
    private _sessionId: string;
    private _invokeId = 100;

    constructor(private _http: Http,
        private _configService: ConfigService,
        private _userService: UserService,
        protected _aiService: AiService,
        private _translateService: TranslateService) {

        this.armUrl = ArmServiceHelper.armEndpoint;

        _userService.getStartupInfo()
        .subscribe(info =>{
            this._token = info.token;
            this._sessionId = info.sessionId;
        });

    }


    send(method: string, url: string, body?: any, etag?: string, headers?: Headers, invokeApi?: boolean) {

        headers = headers ? headers : ArmServiceHelper.getHeaders(this._token, this._sessionId, etag);

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
        return this._http.get(url, {headers: ArmServiceHelper.getHeaders(this._token, this._sessionId)});
    }

    delete(resourceId: string, apiVersion?: string) {
        const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.delete(url, {headers: ArmServiceHelper.getHeaders(this._token, this._sessionId)});
    }

    put(resourceId: string, body: any, apiVersion?: string) {
        const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.put(url, JSON.stringify(body), {headers: ArmServiceHelper.getHeaders(this._token, this._sessionId)});
    }

    post(resourceId: string, body: any, apiVersion?: string) {
        const content = !!body ? JSON.stringify(body) : null;
        const url = `${this.armUrl}${resourceId}?api-version=${apiVersion ? apiVersion : this.websiteApiVersion}`;
        return this._http.post(url, content, {headers: ArmServiceHelper.getHeaders(this._token, this._sessionId)});
    }
}
