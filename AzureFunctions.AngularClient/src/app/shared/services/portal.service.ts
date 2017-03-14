import {Injectable} from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs/Rx';
import {Event, Data, Verbs, Action, LogEntryLevel, Message, UpdateBladeInfo, OpenBladeInfo, StartupInfo} from '../models/portal';
import {ErrorEvent} from '../models/error-event';
import {BroadcastService} from './broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {UserService} from './user.service';
import {AiService} from './ai.service';
import {SetupOAuthRequest, SetupOAuthResponse} from '../../site/deployment-source/deployment';

@Injectable()
export class PortalService {
    public sessionId = "";

    private portalSignature: string = "FxAppBlade";
    private startupInfo: StartupInfo = null;
    private startupInfoObservable : ReplaySubject<StartupInfo>;
    private setupOAuthObservable : Subject<SetupOAuthResponse>;
    private getAppSettingCallback: (appSettingName: string) => void;
    private shellSrc: string;

    constructor(private _broadcastService : BroadcastService,
     private _aiService: AiService) {

        this.startupInfoObservable = new ReplaySubject<StartupInfo>(1);
        this.setupOAuthObservable = new Subject<SetupOAuthResponse>();

        if (this.inIFrame()){
            this.initializeIframe();
        }
    }

    getStartupInfo(){
        return this.startupInfoObservable;
    }

    setupOAuth(input : SetupOAuthRequest){
        this.postMessage(Verbs.setupOAuth, JSON.stringify(input));
        return this.setupOAuthObservable;
    }

    initializeIframe(): void {

        this.shellSrc = window.location.search.match(/=(.+)/)[1];

        window.addEventListener(Verbs.message, this.iframeReceivedMsg.bind(this), false);

        // This is a required message. It tells the shell that your iframe is ready to receive messages.
        this.postMessage(Verbs.ready, null);
        this.postMessage(Verbs.getStartupInfo, null);

        this._broadcastService.subscribe<ErrorEvent>(BroadcastEvent.Error, error => {
            if (error.details) {
                this.logMessage(LogEntryLevel.Error, error.details);
            }
        });
    }

    openBlade(bladeInfo : OpenBladeInfo, source : string){
        this.logAction(source, 'open-blade ' + bladeInfo.detailBlade);
        this._aiService.trackEvent('/site/open-blade', {
            targetBlade : bladeInfo.detailBlade,
            targetExtension : bladeInfo.extension,
            source : source
        });

        this.postMessage(Verbs.openBlade, JSON.stringify(bladeInfo));
    }

    openCollectorBlade(resourceId: string, name: string, source: string, getAppSettingCallback: (appSettingName: string) => void): void {
        this.logAction(source, "open-blade-collector" + name, null);
        this._aiService.trackEvent('/site/open-collector-blade', {
            targetBlade : name,
            source : source
        });

        this.getAppSettingCallback = getAppSettingCallback;
        let payload = {
            resourceId : resourceId,
            bladeName : name
        };

        this.postMessage(Verbs.openBladeCollector, JSON.stringify(payload));
    }

    openCollectorBladeWithInputs(resourceId : string, obj : any, source: string, getAppSettingCallback: (appSettingName: string) => void): void {
        this.logAction(source, "open-blade-collector-inputs" + obj.bladeName, null);

        this._aiService.trackEvent('/site/open-collector-blade', {
            targetBlade : obj.bladeName,
            source : source
        });

        this.getAppSettingCallback = getAppSettingCallback;

        let payload = {
            resourceId : resourceId,
            input : obj
        };

        this.postMessage(Verbs.openBladeCollectorInputs, JSON.stringify(payload));
    }

    closeBlades(){
        this.postMessage(Verbs.closeBlades, "");
    }

    updateBladeInfo(title : string, subtitle : string){
        let payload : UpdateBladeInfo = {
            title : title,
            subtitle : subtitle
        };

        this.postMessage(Verbs.updateBladeInfo, JSON.stringify(payload));
    }

    logAction(subcomponent: string, action: string, data?: any): void{
        let actionStr = JSON.stringify(<Action>{
            subcomponent: subcomponent,
            action: action,
            data: data
        });

        this.postMessage(Verbs.logAction, actionStr);
    }

    setDirtyState(dirty : boolean) : void{
        this.postMessage(Verbs.setDirtyState, JSON.stringify(dirty));
    }

    logMessage(level : LogEntryLevel, message : string, ...restArgs: any[]){
        let messageStr = JSON.stringify(<Message>{
            level : level,
            message : message,
            restArgs : restArgs
        });

        this.postMessage(Verbs.logMessage, messageStr);
    }

    private iframeReceivedMsg(event: Event): void {

        if (!event || !event.data || event.data.signature !== this.portalSignature){
            return;
        }

        var data = event.data.data;
        let methodName = event.data.kind;

        console.log("[iFrame] Received mesg: " + methodName);

        if(methodName === Verbs.sendStartupInfo){
            this.startupInfo = <StartupInfo>data;
            this.sessionId = this.startupInfo.sessionId;
            // this._userService.setToken(startupInfo.token);
            this._aiService.setSessionId(this.sessionId);

            this.startupInfoObservable.next(this.startupInfo);
        }
        else if(methodName === Verbs.sendToken){
            if(this.startupInfo){
                this.startupInfo.token = <string>data;
                this.startupInfoObservable.next(this.startupInfo);
            }
        }
        else if (methodName === Verbs.sendAppSettingName) {
            if(this.getAppSettingCallback){
                this.getAppSettingCallback(data);
                this.getAppSettingCallback = null;
            }
        }
        else if(methodName === Verbs.sendOAuthInfo){
            let info = <SetupOAuthResponse>data;
            this.setupOAuthObservable.next(info);
        }
    }

    private postMessage(verb: string, data: string){
        if(this.inIFrame()){
            window.parent.postMessage(<Data>{
                signature : this.portalSignature,
                kind: verb,
                data: data
            }, this.shellSrc);
        }
    }

    private inIFrame() : boolean{
        return window.parent !== window;
    }
}