import { LanguageServiceHelper } from './language.service-helper';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from './../models/subscription';
import { ArmServiceHelper } from './arm.service-helper';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Constants } from './../models/constants';
import { User } from '../models/user';
import { TenantInfo } from '../models/tenant-info';
import { AiService } from './ai.service';
import { PortalService } from './portal.service';
import { StartupInfo } from '../models/portal';

@Injectable()
export class UserService {
    public inIFrame: boolean;
    public inTab: boolean;
    private _startupInfoStream: ReplaySubject<StartupInfo>;
    private _startupInfo: StartupInfo;
    private _inTry: boolean;

    constructor(
        private _http: Http,
        private _aiService: AiService,
        private _portalService: PortalService,
        private _translateService: TranslateService) {

        this._startupInfoStream = new ReplaySubject<StartupInfo>(1);
        this.inIFrame = PortalService.inIFrame();
        this.inTab = PortalService.inTab();
        this._inTry = window.location.pathname.endsWith('/try');

        this._startupInfo = {
            token: null,
            graphToken: null,
            subscriptions: null,
            sessionId: null,
            acceptLanguage: null,
            effectiveLocale: null,
            resourceId: null
        };

        if (this.inIFrame || this.inTab) {
            this._portalService.getStartupInfo()
                .mergeMap(info => {
                    return Observable.zip(
                        Observable.of(info),
                        this._getLocalizedResources(info, null),
                        (i, r) => ({ info: i, resources: r }));
                })
                .subscribe(r => {
                    const info = r.info;
                    this.updateStartupInfo(info);
                });
        } else if (this._inTry) {
            Observable.zip(
                this._getSubscriptions(null),
                this._getLocalizedResources(this._startupInfo, null),
                (s, r) => ({ subscriptions: s, resources: r })
            )
                .subscribe(r => {
                    this._startupInfo.subscriptions = r.subscriptions;
                    this.updateStartupInfo(this._startupInfo);
                });
        }
    }

    getTenants() {
        return this._http.get(Constants.serviceHost + 'api/tenants')
            .catch(() => Observable.of({ json: () => [] }))
            .map(r => <TenantInfo[]>r.json());
    }

    getAndUpdateToken() {
        return this._http.get(Constants.serviceHost + 'api/token?plaintext=true')
            .catch(() => {

                // [ellhamai] - In Standalone mode, this call will always fail.  I've opted to leaving
                // this call in place instead of preventing it from being called because:
                // 1. It makes the code simpler to always call the API
                // 2. It makes it easier to test because we can test Standalone mode with production ARM
                return Observable.of(null);
            })
            .map(r => {

                let token: string;
                if (r) {
                    token = r.text();
                } else {
                    token = '';
                }

                this._setToken(token);
            });
    }

    getUser() {
        return this._http.get(Constants.serviceHost + 'api/token')
            .map(r => <User>r.json());
    }

    private _setToken(token: string) {
        if (token !== this._startupInfo.token) {

            Observable.zip(
                this._getSubscriptions(token),
                this._getLocalizedResources(this._startupInfo, null),
                (s, r) => ({ subs: s, resources: r }))
                .subscribe(r => {
                    const info = {
                        token: token,
                        graphToken: this._startupInfo.graphToken,
                        subscriptions: r.subs,
                        sessionId: this._startupInfo.sessionId,
                        acceptLanguage: this._startupInfo.acceptLanguage,
                        effectiveLocale: this._startupInfo.effectiveLocale,
                        resourceId: this._startupInfo.resourceId,
                        stringResources: r.resources
                    };

                    this.updateStartupInfo(info);
                });

            try {
                var encodedUser = token.split('.')[1];
                var user: { unique_name: string, email: string } = JSON.parse(atob(encodedUser));
                var userName = (user.unique_name || user.email).replace(/[,;=| ]+/g, "_");
                this._aiService.setAuthenticatedUserContext(userName);
            } catch (error) {
                this._aiService.trackException(error, 'setToken');
            }
        }
    }

    getStartupInfo() {
        return this._startupInfoStream;
    }

    updateStartupInfo(startupInfo: StartupInfo) {
        this._startupInfo = startupInfo;
        this._startupInfoStream.next(startupInfo);
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

    private _getSubscriptions(token: string) {
        if (this._inTry) {
            return Observable.of([{
                subscriptionId: 'TrialSubscription',
                displayName: 'Trial Subscription',
                state: 'Enabled'
            }]);
        }

        const url = `${ArmServiceHelper.armEndpoint}/subscriptions?api-version=2014-04-01`;
        const headers = ArmServiceHelper.getHeaders(token);

        return this._http.get(url, { headers: headers })
            .map(r => <Subscription[]>(r.json().value));
    }

    private _getLocalizedResources(startupInfo: StartupInfo, runtime: string): Observable<any> {

        const input = LanguageServiceHelper.getLanguageAndRuntime(startupInfo, runtime);

        return this._http.get(
            `${Constants.serviceHost}api/resources?name=${input.lang}&runtime=${input.runtime}`,
            { headers: LanguageServiceHelper.getApiControllerHeaders() })

            .retryWhen(LanguageServiceHelper.retry)
            .map(r => {
                const resources = r.json();
                LanguageServiceHelper.setTranslation(resources, input.lang, this._translateService);
            });
    }
}
