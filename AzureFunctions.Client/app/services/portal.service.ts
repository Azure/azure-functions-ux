﻿import {Injectable} from 'angular2/core';
import {IPortalService} from './iportal.service.ts';
import {Observable, Subject} from 'rxjs/Rx';
import {Event, Data, Verbs, Action} from '../models/portal';

@Injectable()
export class PortalService implements IPortalService {
    private portalSignature: string = "FxAppBlade";
    private resourceIdObservable: Subject<string>;
    private tokenObservable: Subject<string>;
    private getAppSettingCallback: (appSettingName: string) => void;
    private shellSrc: string;

    constructor() {
        this.tokenObservable = new Subject<string>();
        this.resourceIdObservable = new Subject<string>();
        if (this.inIFrame()){
            this.initializeIframe();
        }
    }

    getToken() {
        return this.tokenObservable;
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

    logAction(subcomponent: string, action: string, data?: any): void{
        let actionStr = JSON.stringify(<Action>{
            subcomponent: subcomponent,
            action: action,
            data: data
        });

        this.postMessage(Verbs.logAction, actionStr);
    }

    private iframeReceivedMsg(event: Event): void {
        
        if (event && event.data && event.data.signature !== this.portalSignature) {
            return;
        }

        var data = event.data.data;
        let methodName = event.data.kind;

        console.log("[iFrame] Received mesg: " + methodName);

        if (methodName === Verbs.sendResourceId) {
            this.resourceIdObservable.next(data);
        }
        else if (methodName === Verbs.sendToken) {
            this.tokenObservable.next(data);
        }
        else if (methodName === Verbs.sendAppSettingName) {
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