import { SiteDescriptor } from './../resourceDescriptors';
import { FunctionApp } from './../function-app';
import { AuthzService } from './authz.service';
import { FunctionContainer } from './../models/function-container';
import { Site } from './../models/arm/site';
import { ArmObj } from './../models/arm/arm-obj';
import { Constants } from './../models/constants';
import { Observable } from 'rxjs/Rx';
import {Http, Headers, Response, Request} from '@angular/http';
import { ArmService } from './arm.service';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { AiService } from './ai.service';
import { ConfigService } from './config.service';
import { UserService } from './user.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ArmTryService extends ArmService {

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
        this._aiService.trackEvent("/try/arm-get-failure", {
            uri : resourceId
        });

        throw "[ArmTryService] - get: " + resourceId;
    }

    delete(resourceId : string, apiVersion? : string) : Observable<Response>{

        this._aiService.trackEvent("/try/arm-delete-failure", {
            uri : resourceId
        });

        throw "[ArmTryService] - delete: " + resourceId;
    }

    put(resourceId : string, body : any, apiVersion? : string) : Observable<Response>{
        this._aiService.trackEvent("/try/arm-put-failure", {
            uri : resourceId
        });

        throw "[ArmTryService] - put: " + resourceId;
    }

    post(resourceId : string, body : any, apiVersion? : string) : Observable<Response>{
        this._aiService.trackEvent("/try/arm-post-failure", {
            uri : resourceId
        });

        throw "[ArmTryService] - post: " + resourceId;
    }

    send(method : string, url : string, body? : any, etag? : string, headers? : Headers) : Observable<Response>{
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