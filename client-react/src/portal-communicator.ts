import { loadTheme } from 'office-ui-fabric-react/lib/Styling';
import { Observable, Subject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { SpecCostQueryInput, SpecCostQueryResult } from './models/BillingModels';
import {
  BroadcastMessage,
  BroadcastMessageId,
  IBladeResult,
  IDataMessage,
  IDataMessageResult,
  IDirtyStateInfo,
  IEvent,
  INotificationInfo,
  INotificationStartedInfo,
  IOpenBladeInfo,
  IStartupInfo,
  ISubscriptionRequest,
  IUpdateBladeInfo,
  LogEntryLevel,
  Verbs,
  TokenType,
} from './models/portal-models';
import { ISubscription } from './models/subscription';
import darkModeTheme from './theme/dark';
import lightTheme from './theme/light';
import { Guid } from './utils/Guid';
import Url from './utils/url';
import { Dispatch, SetStateAction } from 'react';
import { ThemeExtended } from './theme/SemanticColorsExtended';
import LogService from './utils/LogService';
export default class PortalCommunicator {
  public static shellSrc: string;
  private static portalSignature = 'FxAppBlade';
  private static portalSignatureFrameBlade = 'FxFrameBlade';
  private static acceptedSignatures = [PortalCommunicator.portalSignature, PortalCommunicator.portalSignatureFrameBlade];

  private static postMessage(verb: string, data: string | null) {
    if (Url.getParameterByName(null, 'appsvc.bladetype') === 'appblade') {
      window.parent.postMessage(
        {
          data,
          kind: verb,
          signature: this.portalSignature,
        },
        this.shellSrc
      );
    } else {
      window.parent.postMessage(
        {
          data,
          kind: verb,
          signature: this.portalSignatureFrameBlade,
        },
        this.shellSrc
      );
    }
  }

  public currentTheme = 'lightTheme';
  private operationStream = new Subject<IDataMessage<any>>();
  private notificationStartStream = new Subject<INotificationStartedInfo>();
  private frameId;
  private i18n: any;
  private setTheme: Dispatch<SetStateAction<ThemeExtended>>;
  private setArmToken: Dispatch<SetStateAction<string>>;
  private setStartupInfo: Dispatch<SetStateAction<IStartupInfo<any>>>;
  public initializeIframe(
    setTheme: Dispatch<SetStateAction<ThemeExtended>>,
    setArmToken: Dispatch<SetStateAction<string>>,
    setStartupInfo: Dispatch<SetStateAction<IStartupInfo<any>>>,
    i18n: any = null
  ): void {
    this.frameId = Url.getParameterByName(null, 'frameId');
    this.i18n = i18n;
    this.setTheme = setTheme;
    this.setArmToken = setArmToken;
    this.setStartupInfo = setStartupInfo;
    window.addEventListener(Verbs.message, this.iframeReceivedMsg.bind(this) as any, false);
    window.updateAuthToken = this.getAdToken.bind(this);
    const shellUrl = decodeURI(window.location.href);
    const shellSrc = Url.getParameterByName(shellUrl, 'trustedAuthority') || '';
    PortalCommunicator.shellSrc = shellSrc;
    if (shellSrc) {
      const getStartupInfoObj = {
        iframeHostName: null,
      };
      // This is a required message. It tells the shell that your iframe is ready to receive messages.
      PortalCommunicator.postMessage(Verbs.ready, null);
      PortalCommunicator.postMessage(Verbs.initializationcomplete, null);
      PortalCommunicator.postMessage(Verbs.getStartupInfo, this.packageData(getStartupInfoObj));
    }
  }

  public openBlade<T>(bladeInfo: IOpenBladeInfo, source: string): Promise<IBladeResult<T>> {
    const payload: IDataMessage<IOpenBladeInfo> = {
      operationId: Guid.newGuid(),
      data: bladeInfo,
    };

    PortalCommunicator.postMessage(Verbs.openBlade2, this.packageData(payload));
    return new Promise((resolve, reject) => {
      this.operationStream
        .pipe(
          filter(o => o.operationId === payload.operationId),
          first(),
          map((r: IDataMessage<IDataMessageResult<IBladeResult<T>>>) => {
            return r.data.result;
          })
        )
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  public getSpecCosts(query: SpecCostQueryInput): Observable<SpecCostQueryResult> {
    const payload: IDataMessage<SpecCostQueryInput> = {
      operationId: Guid.newGuid(),
      data: query,
    };

    PortalCommunicator.postMessage(Verbs.getSpecCosts, this.packageData(payload));
    return this.operationStream.pipe(
      filter(o => o.operationId === payload.operationId),
      first(),
      map((r: IDataMessage<IDataMessageResult<SpecCostQueryResult>>) => {
        return r.data.result;
      })
    );
  }

  public getSubscription(subscriptionId: string): Observable<ISubscription> {
    const payload: IDataMessage<ISubscriptionRequest> = {
      operationId: Guid.newGuid(),
      data: {
        subscriptionId,
      },
    };

    PortalCommunicator.postMessage(Verbs.getSubscriptionInfo, this.packageData(payload));
    return this.operationStream.pipe(
      filter(o => o.operationId === payload.operationId),
      first(),
      map((r: IDataMessage<IDataMessageResult<ISubscription>>) => {
        return r.data.result;
      })
    );
  }

  public closeBlades() {
    PortalCommunicator.postMessage(Verbs.closeBlades, this.packageData({}));
  }

  public closeSelf() {
    PortalCommunicator.postMessage(Verbs.closeSelf, '');
  }

  public updateBladeInfo(title: string, subtitle: string) {
    const payload: IUpdateBladeInfo = {
      title,
      subtitle,
    };

    PortalCommunicator.postMessage(Verbs.updateBladeInfo, this.packageData(payload));
  }

  public loadComplete() {
    PortalCommunicator.postMessage(Verbs.loadComplete, null);
  }

  public startNotification(title: string, description: string) {
    const payload: INotificationInfo = {
      title,
      description,
      id: Guid.newTinyGuid(),
      state: 'start',
    };

    PortalCommunicator.postMessage(Verbs.setNotification, this.packageData(payload));
    return payload.id!;
  }

  public stopNotification(id: string, success: boolean, description: string) {
    let state = 'success';
    if (!success) {
      state = 'fail';
    }

    const payload: INotificationInfo = {
      id,
      state,
      description,
      title: '',
    };

    PortalCommunicator.postMessage(Verbs.setNotification, this.packageData(payload));
  }

  public updateDirtyState(dirty: boolean, message?: string): void {
    const info: IDirtyStateInfo = {
      dirty,
      message,
    };

    PortalCommunicator.postMessage(Verbs.updateDirtyState, this.packageData(info));
  }

  public logMessage(level: LogEntryLevel, message: string, ...restArgs: any[]) {
    const messageStr = this.packageData({
      level,
      message,
      restArgs,
    });
    PortalCommunicator.postMessage(Verbs.logMessage, messageStr);
  }

  public logAction(subcomponent: string, action: string, data?: { [name: string]: string }): void {
    const actionStr = this.packageData({
      subcomponent,
      action,
      data,
    });
    PortalCommunicator.postMessage(Verbs.logAction, actionStr);
  }

  public returnPcv3Results<T>(results: T) {
    const payload: IDataMessage<T> = {
      operationId: Guid.newGuid(),
      data: results,
    };

    PortalCommunicator.postMessage(Verbs.returnPCV3Results, this.packageData(payload));
  }

  public getAdToken(tokenType: TokenType): Promise<string> {
    const operationId = Guid.newGuid();

    const payload = {
      operationId,
      data: {
        tokenType,
      },
    };

    PortalCommunicator.postMessage('get-ad-token', this.packageData(payload));
    return new Promise((resolve, reject) => {
      this.operationStream
        .pipe(
          filter(o => o.operationId === operationId),
          first()
        )
        .subscribe((o: IDataMessage<IDataMessageResult<any>>) => {
          if (o.data.status === 'success') {
            resolve(o.data.result.token);
          } else {
            return reject();
          }
        });
    });
  }

  public broadcastMessage<T>(id: BroadcastMessageId, resourceId: string, metadata?: T): void {
    const info: BroadcastMessage<T> = {
      id,
      resourceId,
      metadata,
    };

    PortalCommunicator.postMessage(Verbs.broadcastMessage, this.packageData(info));
  }

  private iframeReceivedMsg(event: IEvent): void {
    if (!event || !event.data) {
      return;
    }
    if (event.data.data && event.data.data.frameId && event.data.data.frameId !== this.frameId) {
      return;
    }
    if (!PortalCommunicator.acceptedSignatures.find(s => event.data.signature !== s)) {
      return;
    }

    const data = event.data.data;
    const methodName = event.data.kind;

    LogService.debug(`iFrame-${this.frameId}]`, `Received mesg: ${methodName}  for frameId: ${event.data.data && event.data.data.frameId}`);

    if (methodName === Verbs.sendStartupInfo) {
      const startupInfo = data as IStartupInfo<any>;
      if (this.currentTheme !== startupInfo.theme) {
        const newTheme = startupInfo.theme === 'dark' ? darkModeTheme : lightTheme;
        loadTheme(newTheme);
        this.setTheme(newTheme as ThemeExtended);
        this.currentTheme = startupInfo.theme;
      }
      this.setArmEndpointInternal(startupInfo.armEndpoint);
      this.setArmTokenInternal(startupInfo.token);
      this.i18n.changeLanguage(startupInfo.effectiveLocale);
      this.setStartupInfo(startupInfo);
    } else if (methodName === Verbs.sendToken2) {
      this.setArmTokenInternal(data.token);
    } else if (methodName === Verbs.sendNotificationStarted) {
      this.notificationStartStream.next(data);
    } else if (methodName === Verbs.sendData) {
      this.operationStream.next(data);
    }
  }

  private setArmTokenInternal = (token: string) => {
    this.setArmToken(token);
    window.authToken = token;
  };

  private setArmEndpointInternal = (endpoint: string) => {
    window.armEndpoint = endpoint;
  };
  private packageData = (data: any) => {
    data.frameId = this.frameId;
    return JSON.stringify(data);
  };
}
