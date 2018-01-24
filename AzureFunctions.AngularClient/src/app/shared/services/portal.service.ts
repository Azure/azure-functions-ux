import { ArmServiceHelper } from './arm.service-helper';
import { Jwt } from './../Utilities/jwt';
import { Observable } from 'rxjs/Observable';
import { Url } from './../Utilities/url';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { PinPartInfo, GetStartupInfo, NotificationInfo, NotificationStartedInfo, DataMessage, BladeResult, DirtyStateInfo } from './../models/portal';
import { Event, Data, Verbs, Action, LogEntryLevel, Message, UpdateBladeInfo, OpenBladeInfo, StartupInfo, TimerEvent } from '../models/portal';
import { ErrorEvent } from '../models/error-event';
import { BroadcastService } from './broadcast.service';
import { BroadcastEvent } from '../models/broadcast-event';
import { AiService } from './ai.service';
import { Guid } from '../Utilities/Guid';

@Injectable()
export class PortalService {
    public sessionId = '';
    public resourceId: string;
    public isEmbeddedFunctions = Url.getParameterByName(window.location.href, 'appsvc.embedded') === 'functions';

    private portalSignature = 'FxAppBlade';
    private portalSignatureFrameBlade = 'FxFrameBlade';
    private embeddedSignature = 'FunctionsEmbedded';

    private acceptedSignatures = [this.portalSignature, this.portalSignatureFrameBlade, this.embeddedSignature];
    private acceptedOrigins = [
        'https://ms.portal.azure.com',
        'https://rc.portal.azure.com',
        'https://portal.azure.com',
        'https://portal.microsoftazure.de',
        'https://portal.azure.cn',
        'https://portal.azure.us',
        'https://powerapps.cloudapp.net',
        'https://tip1.web.powerapps.com'
    ];

    private startupInfo: StartupInfo | null;
    private startupInfoObservable: ReplaySubject<StartupInfo>;
    private getAppSettingCallback: (appSettingName: string) => void;
    private shellSrc: string;
    private notificationStartStream: Subject<NotificationStartedInfo>;

    private operationStream = new Subject<DataMessage<any>>();

    public static inIFrame(): boolean {
        return window.parent !== window && window.location.pathname !== '/context.html';
    }

    public static inTab(): boolean {
        return (Url.getParameterByName(null, 'tabbed') === 'true');
    }

    constructor(private _broadcastService: BroadcastService, private _aiService: AiService) {

        this.startupInfoObservable = new ReplaySubject<StartupInfo>(1);
        this.notificationStartStream = new Subject<NotificationStartedInfo>();

        if (PortalService.inIFrame()) {
            this.initializeIframe();
        }
    }

    getStartupInfo() {
        return this.startupInfoObservable;
    }

    private initializeIframe(): void {

        const shellUrl = decodeURI(window.location.href);
        this.shellSrc = Url.getParameterByName(shellUrl, 'trustedAuthority');
        window.addEventListener(Verbs.message, this.iframeReceivedMsg.bind(this), false);

        const appsvc = window.appsvc;
        const getStartupInfoObj: GetStartupInfo = {
            iframeHostName: appsvc && appsvc.env && appsvc.env.hostName ? appsvc.env.hostName : null
        };

        // This is a required message. It tells the shell that your iframe is ready to receive messages.
        this.postMessage(Verbs.ready, null);
        this.postMessage(Verbs.getStartupInfo, JSON.stringify(getStartupInfoObj));

        this._broadcastService.subscribe<ErrorEvent>(BroadcastEvent.Error, error => {
            if (error.message) {
                this.logMessage(LogEntryLevel.Error, error.message);
            }
        });
    }

    sendTimerEvent(evt: TimerEvent) {
        this.postMessage(Verbs.logTimerEvent, JSON.stringify(evt));
    }

    openBlade(bladeInfo: OpenBladeInfo, source: string) {
        this.logAction(source, 'open-blade ' + bladeInfo.detailBlade);
        this._aiService.trackEvent('/site/open-blade', {
            targetBlade: bladeInfo.detailBlade,
            targetExtension: bladeInfo.extension,
            source: source
        });

        this.postMessage(Verbs.openBlade, JSON.stringify(bladeInfo));
    }

    openCollectorBlade(resourceId: string, name: string, source: string, getAppSettingCallback: (appSettingName: string) => void): void {
        this.logAction(source, 'open-blade-collector' + name, null);
        this._aiService.trackEvent('/site/open-collector-blade', {
            targetBlade: name,
            source: source
        });

        this.getAppSettingCallback = getAppSettingCallback;
        const payload = {
            resourceId: resourceId,
            bladeName: name
        };

        this.postMessage(Verbs.openBladeCollector, JSON.stringify(payload));
    }

    openCollectorBladeWithInputs(
        resourceId: string,
        obj: any,
        source: string,
        getAppSettingCallback: (appSettingName: string) => void,
        bladeName?: string) {
        this.logAction(source, 'open-blade-collector-inputs' + obj.bladeName, null);

        this._aiService.trackEvent('/site/open-collector-blade', {
            targetBlade: obj.bladeName,
            source: source
        });

        this.getAppSettingCallback = getAppSettingCallback;

        const operationId = Guid.newGuid();

        const payload = {
            resourceId: resourceId,
            input: obj,
            bladeName: bladeName,
            operationId: operationId
        };

        this.postMessage(Verbs.openBladeCollectorInputs, JSON.stringify(payload));
        return this.operationStream
            .filter(o => o.operationId === operationId)
            .switchMap((o: DataMessage<BladeResult>) => {
                if (o.data.status === 'success') {
                    return Observable.of(o.data);
                } else if (o.data.status === 'cancelled') {
                    return Observable.of(null);
                } else {
                    return Observable.throw(o.data);
                }
            });
    }

    closeBlades() {
        this.postMessage(Verbs.closeBlades, '');
    }

    updateBladeInfo(title: string, subtitle: string) {
        const payload: UpdateBladeInfo = {
            title: title,
            subtitle: subtitle
        };

        this.postMessage(Verbs.updateBladeInfo, JSON.stringify(payload));
    }

    pinPart(pinPartInfo: PinPartInfo) {
        this.postMessage(Verbs.pinPart, JSON.stringify(pinPartInfo));
    }

    startNotification(title: string, description: string) {
        if (PortalService.inIFrame()) {
            const payload: NotificationInfo = {
                state: 'start',
                title: title,
                description: description
            };

            this.postMessage(Verbs.setNotification, JSON.stringify(payload));
        }
        else {
            setTimeout(() => {
                this.notificationStartStream.next({ id: 'id' });
            });
        }

        return this.notificationStartStream;
    }

    stopNotification(id: string, success: boolean, description: string) {
        let state = 'success';
        if (!success) {
            state = 'fail';
        }

        const payload: NotificationInfo = {
            id: id,
            state: state,
            title: null,
            description: description
        };

        this.postMessage(Verbs.setNotification, JSON.stringify(payload));
    }

    logAction(subcomponent: string, action: string, data?: any): void {
        const actionStr = JSON.stringify(<Action>{
            subcomponent: subcomponent,
            action: action,
            data: data
        });

        this.postMessage(Verbs.logAction, actionStr);
    }

    // Deprecated
    setDirtyState(dirty: boolean): void {
        this.postMessage(Verbs.setDirtyState, JSON.stringify(dirty));
    }

    updateDirtyState(dirty: boolean, message?: string): void {
        const info: DirtyStateInfo = {
            dirty: dirty,
            message: message
        };

        this.postMessage(Verbs.updateDirtyState, JSON.stringify(info));
    }

    logMessage(level: LogEntryLevel, message: string, ...restArgs: any[]) {
        const messageStr = JSON.stringify(<Message>{
            level: level,
            message: message,
            restArgs: restArgs
        });

        this.postMessage(Verbs.logMessage, messageStr);
    }

    private iframeReceivedMsg(event: Event): void {
        if (!event || !event.data) {
            return;
        } else if (!this.acceptedOrigins.find(o => event.origin.toLowerCase() === o.toLowerCase())) {
            return;
        } else if (!this.acceptedSignatures.find(s => event.data.signature !== s)) {
            return;
        }

        const data = event.data.data;
        const methodName = event.data.kind;

        console.log('[iFrame] Received mesg: ' + methodName);

        if (methodName === Verbs.sendStartupInfo) {
            this.startupInfo = <StartupInfo>data;
            this.sessionId = this.startupInfo.sessionId;
            this._aiService.setSessionId(this.sessionId);

            // Prefer whatever Ibiza sends us if hosted in iframe.  This is mainly for national clouds
            ArmServiceHelper.armEndpoint = this.startupInfo.armEndpoint ? this.startupInfo.armEndpoint : ArmServiceHelper.armEndpoint;
            window.appsvc.env.azureResourceManagerEndpoint = ArmServiceHelper.armEndpoint;

            this.startupInfoObservable.next(this.startupInfo);
            this.logTokenExpiration(this.startupInfo.token, '/portal-service/token-new-startupInfo');
        } else if (methodName === Verbs.sendToken) {
            if (this.startupInfo) {
                this.startupInfo.token = <string>data;
                this.startupInfoObservable.next(this.startupInfo);
                this.logTokenExpiration(this.startupInfo.token, '/portal-service/token-new');
            }
        } else if (methodName === Verbs.sendAppSettingName) {
            if (this.getAppSettingCallback) {
                this.getAppSettingCallback(data);
                this.getAppSettingCallback = null;
            }
        } else if (methodName === Verbs.sendNotificationStarted) {
            this.notificationStartStream.next(data);
        } else if (methodName === Verbs.sendInputs) {
            if (!this.startupInfo) {
                return;
            }

            this.startupInfo.resourceId = data.resourceId;
            this.startupInfoObservable.next(this.startupInfo);

        } else if (methodName === Verbs.sendData) {
            this.operationStream.next(data);
        }
    }

    private logTokenExpiration(token: string, eventId: string) {
        const jwt = Jwt.tryParseJwt(this.startupInfo.token);
        this._aiService.trackEvent(eventId, {
            expire: jwt ? new Date(jwt.exp).toISOString() : ''
        });
    }

    private postMessage(verb: string, data: string) {
        if (PortalService.inIFrame()) {
            window.parent.postMessage(<Data>{
                signature: this.portalSignature,
                kind: verb,
                data: data
            }, this.shellSrc);

            window.parent.postMessage(<Data>{
                signature: this.portalSignatureFrameBlade,
                kind: verb,
                data: data
            }, this.shellSrc);
        }
    }
}
