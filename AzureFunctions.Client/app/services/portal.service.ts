import {Injectable} from 'angular2/core';
import {IPortalService} from './iportal.service.ts';
import {Observable, Subject} from 'rxjs/Rx';
import {Event, Data, Verbs} from '../models/portal';

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

    openBlade(name: string) : void{
        this.postMessage(Verbs.openBlade, name);
    }

    openCollectorBlade(name: string, getAppSettingCallback: (appSettingName: string) => void): void {
        this.getAppSettingCallback = getAppSettingCallback;
        this.postMessage(Verbs.openBlade, name);
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