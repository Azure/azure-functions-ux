import {Injectable} from 'angular2/core';
import {IPortalService} from './iportal.service.ts';
import {Observable, Subject} from 'rxjs/Rx';

@Injectable()
export class PortalService implements IPortalService {
    private portalSignature: string = "pcIframe";
    private getAppSettingCallback: (appSettingName: string, cancelled: boolean) => void;
    private resourceIdObservable: Subject<string>;
    private tokenObservable: Subject<string>;

    constructor() {
        this.tokenObservable = new Subject<string>();
        this.resourceIdObservable = new Subject<string>();
        window.addEventListener("message", this.iframeReceivedMsg.bind(this), false);
        this.postMessage("ready");

        // Temporary since portal hides the ready message from the extension.  Once we have the new App Blade,
        // it will pass it through and we can get rid of this.  Currently we're just using this to tell
        // Ibiza to resolve its onInputsSet call which stops the loading bar.
        this.postMessage("initialized");
    }

    getToken() {
        return this.tokenObservable;
    }

    getResourceId() {
        return this.resourceIdObservable;
    }

    openBlade(name: string) : void{
        this.postMessage({
            method: 'open-' + name
        })
    }

    openCollectorBlade(name: string, getAppSettingCallback: (appSettingName: string, cancelled : boolean) => void): void {
        this.getAppSettingCallback = getAppSettingCallback;
        this.postMessage({
            method: 'open-' + name
        })
    }

    private iframeReceivedMsg(event: any): void {
        if (event.data["signature"] !== this.portalSignature) {
            return;
        }
        var data = event.data["data"];
        var methodName = !!data.method ? data.method : data;
        console.log("[iFrame] Received mesg: " + methodName);

        if (methodName === "send-resourceId") {
            this.resourceIdObservable.next(data.resourceId);
        } else if (data.method === 'send-token') {
            this.tokenObservable.next(data.token);
        } else if (data.method === 'send-tokenrefresh') {
            this.tokenObservable.next(data.token);
        } else if (data.method === 'send-appSettingName') {
            if (this.getAppSettingCallback) {
                this.getAppSettingCallback(data.appSettingName, data.cancelled);
                this.getAppSettingCallback = null;
            }
        }
    }

    private postMessage(data : any){
        window.parent.postMessage({
            signature: this.portalSignature,
            data: data
        },
        "*" /* Wildcard until Fx adds support to pass us parent URL */);
    }
}