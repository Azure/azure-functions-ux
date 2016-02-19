import {Injectable} from 'angular2/core';
import {IPortalService} from './iportal.service.ts';

@Injectable()
export class PortalService implements IPortalService {
    private portalSignature: string = "pcIframe";
    private iFrameInitCallback: (token: string) => void;

    get inIFrame() : boolean{
        return window.parent !== window;
    }

    initializeIframe(callback: (token: string) => void): void {
        this.iFrameInitCallback = callback;

        window.addEventListener("message", this.iframeReceivedMsg.bind(this), false);
        this.postMessage("ready");
    }

    openSettings(): void{
        this.postMessage({
            method: 'open-settings'
        });
    }

    private iframeReceivedMsg(event: any): void {
        if (event.data["signature"] !== this.portalSignature) {
            return;
        }
        var data = event.data["data"];
        var methodName = !!data.method ? data.method : data;
        console.log("[iFrame] Received mesg: " + methodName);

        if (methodName === "Initialized") {
            return;
        }
        else if (data.method === 'send-token') {
            this.iFrameInitCallback(data.token);
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