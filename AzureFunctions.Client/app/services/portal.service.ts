import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import {Event, Data, Verbs, Action, LogEntryLevel, Message} from '../models/portal';
import {ErrorEvent} from '../models/error-event';
import {BroadcastService} from './broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {UserService} from './user.service';

@Injectable()
export class PortalService {
    public sessionId = "";
    private portalSignature: string = "FxAppBlade";
    private resourceIdObservable: ReplaySubject<string>;
    private getAppSettingCallback: (appSettingName: string) => void;
    private shellSrc: string;

    constructor(private _broadcastService : BroadcastService, private _userService: UserService) {
        this.resourceIdObservable = new ReplaySubject<string>(1);
        if (this.inIFrame()){
            this.initializeIframe();
        }
    }

    getResourceId() {
        return this.resourceIdObservable;
    }

    initializeIframe(): void {

        this.shellSrc = window.location.search.match(/=(.+)/)[1];

        window.addEventListener(Verbs.message, this.iframeReceivedMsg.bind(this), false);

        // This is a required message. It tells the shell that your iframe is ready to receive messages.
        this.postMessage(Verbs.ready, null);
        this.postMessage(Verbs.getAuthToken, null);

        this._broadcastService.subscribe<ErrorEvent>(BroadcastEvent.Error, error => {
            if (error.details) {
                this.logMessage(LogEntryLevel.Error, error.details);
            }
        });
    }

    openBlade(name: string, source: string) : void{
        this.logAction(source, "open blade " + name, null);
        this.postMessage(Verbs.openBlade, name);
    }

    openCollectorBlade(name: string, source: string, getAppSettingCallback: (appSettingName: string) => void): void {
        this.logAction(source, "open-blade-" + name, null);
        this.getAppSettingCallback = getAppSettingCallback;
        this.postMessage(Verbs.openBlade, name);
    }

    openCollectorBladeWithInputs(obj : any, source: string, getAppSettingCallback: (appSettingName: string) => void): void {
        this.logAction(source, "open-blade-input" + obj.bladeName, null);
        this.getAppSettingCallback = getAppSettingCallback;

        let inputStr = JSON.stringify(obj);

        this.postMessage(Verbs.openBladeWithInputs, inputStr);
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

        if (methodName === Verbs.sendResourceId) {
            this.resourceIdObservable.next(data);
        } else if(methodName === Verbs.sendSessionId){
            this.sessionId = data;
        } else if (methodName === Verbs.sendToken) {
            this._userService.setToken(data);
        } else if (methodName === Verbs.sendAppSettingName) {
            if(this.getAppSettingCallback){
                this.getAppSettingCallback(data);
                this.getAppSettingCallback = null;
            }
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