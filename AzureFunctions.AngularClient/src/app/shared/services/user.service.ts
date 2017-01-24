import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
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
    // private functionContainerSubject: ReplaySubject<FunctionContainer>;
    // private tokenSubject: ReplaySubject<string>;
    private startupInfoSubject : ReplaySubject<StartupInfo>;
    private currentStartupInfo : StartupInfo;
    // private languageSubject: ReplaySubject<string>;
    // private currentToken: string;
    

    constructor(private _http: Http, private _aiService: AiService, private _portalService : PortalService) {
        // this.tokenSubject = new ReplaySubject<string>(1);
        this.startupInfoSubject = new ReplaySubject<StartupInfo>(1);
        // this.languageSubject = new ReplaySubject<string>(1);
        this.inIFrame = window.parent !== window;
        // this.functionContainerSubject = new ReplaySubject<FunctionContainer>(1);

        this.currentStartupInfo = {
            token : null,
            subscriptions : null,
            sessionId : null,
            acceptLanguage : null,
            effectiveLocale : null
        };

        this._portalService.getStartupInfo().subscribe(info => this.startupInfoSubject.next(info));
    }

    getTenants() {
        return this._http.get('api/tenants')
            .catch(e => Observable.of({ json: () => [] }))
            .map<TenantInfo[]>(r => r.json());
    }

    getUser() {
        return this._http.get('api/token')
            .map<User>(r => r.json());
    }


    setToken(token: string) {
        if (token !== this.currentStartupInfo.token) {

            this.currentStartupInfo = {
                token : token,
                subscriptions : this.currentStartupInfo.subscriptions,
                sessionId : this.currentStartupInfo.sessionId,
                acceptLanguage : this.currentStartupInfo.acceptLanguage,
                effectiveLocale : this.currentStartupInfo.effectiveLocale
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

        // if (this.inIFrame) {
        //     return this._portalService.getStartupInfo();
        // } else {
        //     return this._http.get('api/token?plaintext=true').map(r => {
        //         return <StartupInfo>{
        //             sessionId : null,
        //             token : r.text(),
        //             subscriptions : null
        //         }
        //     });
        // }
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
