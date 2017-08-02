import { Injectable } from '@angular/core';
import { Http, Headers, Response, Request } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { SiteDescriptor } from './../resourceDescriptors';
import { FunctionApp } from './../function-app';
import { AuthzService } from './authz.service';
import { FunctionContainer } from './../models/function-container';
import { Site } from './../models/arm/site';
import { ArmObj } from './../models/arm/arm-obj';
import { Constants } from './../models/constants';
import { ArmService } from './arm.service';
import { AiService } from './ai.service';
import { ConfigService } from './config.service';
import { UserService } from './user.service';

@Injectable()
export class ArmTryService extends ArmService {

    private _tryFunctionApp: FunctionApp;

    private _whiteListedPrefixUrls: string[] = [
        `${Constants.serviceHost}api`
    ];

    constructor(http: Http,
        configService: ConfigService,
        userService: UserService,
        aiService: AiService,
        translateService: TranslateService) {

        super(http, configService, userService, aiService, translateService);
    }

    public set tryFunctionApp(tryFunctionApp: FunctionApp) {
        this._tryFunctionApp = tryFunctionApp;
        this._whiteListedPrefixUrls.push(`${tryFunctionApp.getScmUrl()}/api`);
        this._whiteListedPrefixUrls.push(`${tryFunctionApp.getMainSiteUrl()}`);
    }

    public get tryFunctionApp() {
        return this._tryFunctionApp;
    }

    get(resourceId: string, _?: string): Observable<Response> {
        this._aiService.trackEvent('/try/arm-get-failure', {
            uri: resourceId
        });

        throw new Error('[ArmTryService] - get: ' + resourceId);
    }

    delete(resourceId: string, _?: string): Observable<Response> {

        this._aiService.trackEvent('/try/arm-delete-failure', {
            uri: resourceId
        });

        throw new Error('[ArmTryService] - delete: ' + resourceId);
    }

    put(resourceId: string, _: any, __?: string): Observable<Response> {
        this._aiService.trackEvent('/try/arm-put-failure', {
            uri: resourceId
        });

        throw new Error('[ArmTryService] - put: ' + resourceId);
    }

    post(resourceId: string, _: any, __?: string): Observable<Response> {
        this._aiService.trackEvent('/try/arm-post-failure', {
            uri: resourceId
        });

        throw new Error('[ArmTryService] - post: ' + resourceId);
    }

    send(method: string, url: string, body?: any, etag?: string, headers?: Headers): Observable<Response> {
        const urlNoQuery = url.toLowerCase().split('?')[0];

        if (this._whiteListedPrefixUrls.find(u => urlNoQuery.startsWith(u.toLowerCase()))) {
            return super.send(method, url, body, etag, headers);
        } else if (urlNoQuery.endsWith(this.tryFunctionApp.site.id.toLowerCase())) {
            return Observable.of(this._getFakeResponse(this.tryFunctionApp.site));
        } else if (urlNoQuery.endsWith('/providers/microsoft.authorization/permissions')) {
            return Observable.of(this._getFakeResponse({
                'value': [{
                    'actions': ['*'],
                    'notActions': []
                }],
                'nextLink': null
            }));
        } else if (urlNoQuery.endsWith('/providers/microsoft.authorization/locks')) {
            return Observable.of(this._getFakeResponse({ 'value': [] }));
        } else if (urlNoQuery.endsWith('/config/web')) {
            return Observable.of(<any>this._getFakeResponse({
                id: this._tryFunctionApp.site.id,
                properties: {
                    scmType: 'None'
                }
            }));
        } else if (urlNoQuery.endsWith('/appsettings/list')) {
            return this.tryFunctionApp.getFunctionContainerAppSettings()
                .map(r => {
                    return this._getFakeResponse({
                        properties: r
                    });
                });
        } else if (urlNoQuery.endsWith('/slots')) {
            return Observable.of(this._getFakeResponse({ value: [] }));
        }

        this._aiService.trackEvent('/try/arm-send-failure', {
            uri: url
        });

        throw new Error('[ArmTryService] - send: ' + url);
    }

    private _getFakeResponse(jsonObj: any): any {
        return {
            headers: {
                get: () => {
                    return null;
                }
            },
            json: () => {
                return jsonObj;
            }
        };
    }
}
