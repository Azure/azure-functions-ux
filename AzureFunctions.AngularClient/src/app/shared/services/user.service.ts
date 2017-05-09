import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { ConfigService } from './config.service';
import { Constants } from './../models/constants';
import {User} from '../models/user';
import {TenantInfo} from '../models/tenant-info';
import {FunctionContainer} from '../models/function-container';
import {IAppInsights} from '../models/app-insights';
import {AiService} from './ai.service';
import {PortalService} from './portal.service';
import {StartupInfo} from '../models/portal';

@Injectable()
export class UserService {
    public inIFrame: boolean;
    private startupInfoSubject : ReplaySubject<StartupInfo>;
    private currentStartupInfo : StartupInfo;

    constructor(
        private _http: Http,
        private _aiService: AiService,
        private _portalService : PortalService,
        private _configService : ConfigService) {

        this.startupInfoSubject = new ReplaySubject<StartupInfo>(1);
        this.inIFrame = window.parent !== window;

        this.currentStartupInfo = {
            token : null,
            subscriptions : null,
            sessionId : null,
            acceptLanguage : null,
            effectiveLocale : null,
            resourceId : null
        };

        this._portalService.getStartupInfo().subscribe(info => this.startupInfoSubject.next(info));
    }

    getTenants() {
        return this._http.get(Constants.serviceHost + 'api/tenants')
            .catch(e => Observable.of({ json: () => [] }))
            .map(r => <TenantInfo[]>r.json());
    }

    getToken(){
        return this._http.get(Constants.serviceHost + 'api/token?plaintext=true')
        .catch(e =>{

            // [ellhamai] - In Standalone mode, this call will always fail.  I've opted to leaving
            // this call in place instead of preventing it from being called because:
            // 1. It makes the code simpler to always call the API
            // 2. It makes it easier to test because we can test Standalone mode with production ARM
            return Observable.of(null);
        })
        .map(r =>{

            let token : string;            
            if(r){
                token = r.text();
            }
            else{
                token = "";
            }

            this.setToken(token);
            return token;
        })
    }

    getUser() {
        return this._http.get(Constants.serviceHost + 'api/token')
            .map(r => <User>r.json());
    }

    setToken(token: string) {
        if (token !== this.currentStartupInfo.token) {

            this.currentStartupInfo = {
                token : token,
                subscriptions : this.currentStartupInfo.subscriptions,
                sessionId : this.currentStartupInfo.sessionId,
                acceptLanguage : this.currentStartupInfo.acceptLanguage,
                effectiveLocale : this.currentStartupInfo.effectiveLocale,
                resourceId : this.currentStartupInfo.resourceId
            }

            this.startupInfoSubject.next(this.currentStartupInfo);

            try {
                var encodedUser = token.split('.')[1];
                var user: {unique_name: string, email: string} = JSON.parse(atob(encodedUser));
                var userName = (user.unique_name || user.email).replace(/[,;=| ]+/g, "_");
                this._aiService.setAuthenticatedUserContext(userName);
            } catch (error) {
                this._aiService.trackException(error, 'setToken');
            }
        }
    }

    getStartupInfo(){
        return this.startupInfoSubject;
    }

    updateStartupInfo(startupInfo : StartupInfo){
        this.startupInfoSubject.next(startupInfo);
    }

    setTryUserName(userName: string) {
        if (userName) {
            try {
                this._aiService.setAuthenticatedUserContext(userName);
            } catch (error) {
                this._aiService.trackException(error, 'setToken');
            }
        }
    }
    // setLanguage(lang: string) {
    //     this.languageSubject.next(lang);
    // }

    // getLanguage(){
    //     return this.languageSubject;
    // }

    // getFunctionContainer() {
    //     return this.functionContainerSubject;
    // }

    // setFunctionContainer(fc: FunctionContainer) {
    //     this.functionContainerSubject.next(fc);
    // }
}
