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
} from './models/portal-models';
import { ISubscription } from './models/subscription';
import { getStartupInfoAction, setupIFrameAction, updateTheme, updateToken } from './modules/portal/actions';
import { updateResourceId } from './modules/site/actions';
import { store } from './store';
import darkModeTheme from './theme/dark';
import lightTheme from './theme/light';
import { Guid } from './utils/Guid';
import Url from './utils/url';

export default class PortalCommunicator {
  private static portalSignature = 'FxAppBlade';
  private static portalSignatureFrameBlade = 'FxFrameBlade';
  private static acceptedSignatures = [PortalCommunicator.portalSignature, PortalCommunicator.portalSignatureFrameBlade];
  private static postMessage(verb: string, data: string | null) {
    const shellSrc = store.getState().portalService.shellSrc;
    if (Url.getParameterByName(null, 'appsvc.bladetype') === 'appblade') {
      window.parent.postMessage(
        {
          data,
          kind: verb,
          signature: this.portalSignature,
        },
        shellSrc
      );
    } else {
      window.parent.postMessage(
        {
          data,
          kind: verb,
          signature: this.portalSignatureFrameBlade,
        },
        shellSrc
      );
    }
  }

  public currentTheme = 'lightTheme';
  private operationStream = new Subject<IDataMessage<any>>();
  private notificationStartStream = new Subject<INotificationStartedInfo>();
  private frameId;
  private i18n: any;
  constructor(i18n: any = null) {
    this.frameId = Url.getParameterByName(null, 'frameId');
    this.i18n = i18n;
  }

  public initializeIframe(): void {
    window.addEventListener(Verbs.message, this.iframeReceivedMsg.bind(this) as any, false);
    const shellUrl = decodeURI(window.location.href);
    const shellSrc = Url.getParameterByName(shellUrl, 'trustedAuthority') || '';
    store.dispatch(setupIFrameAction(shellSrc));
    if (shellSrc) {
      const getStartupInfoObj = {
        iframeHostName: null,
      };
      // This is a required message. It tells the shell that your iframe is ready to receive messages.
      PortalCommunicator.postMessage(Verbs.ready, null);
      PortalCommunicator.postMessage(Verbs.initializationcomplete, null);
      PortalCommunicator.postMessage(Verbs.getStartupInfo, JSON.stringify(getStartupInfoObj));
    }
  }

  public openBlade(bladeInfo: IOpenBladeInfo, source: string): Observable<IBladeResult<any>> {
    const payload: IDataMessage<IOpenBladeInfo> = {
      operationId: Guid.newGuid(),
      data: bladeInfo,
    };

    PortalCommunicator.postMessage(Verbs.openBlade2, this.packageData(payload));
    return this.operationStream.pipe(
      filter(o => o.operationId === payload.operationId),
      first(),
      map((r: IDataMessage<IDataMessageResult<IBladeResult<any>>>) => {
        return r.data.result;
      })
    );
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

  public startNotification(title: string, description: string) {
    const payload: INotificationInfo = {
      id: Guid.newTinyGuid(),
      title,
      description,
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

    console.log(`[iFrame-${this.frameId}] Received mesg: ${methodName}  for frameId: ${event.data.data && event.data.data.frameId}`);

    if (methodName === Verbs.sendStartupInfo) {
      const startupInfo = data as IStartupInfo;
      if (this.currentTheme !== startupInfo.theme) {
        const newTheme = startupInfo.theme === 'dark' ? darkModeTheme : lightTheme;
        loadTheme(newTheme);
        store.dispatch(updateTheme(newTheme as any));
        this.currentTheme = startupInfo.theme;
      }
      this.i18n.changeLanguage(startupInfo.acceptLanguage);
      store.dispatch(getStartupInfoAction(startupInfo));
    } else if (methodName === Verbs.sendToken) {
      store.dispatch(updateToken(data));
    } else if (methodName === Verbs.sendNotificationStarted) {
      this.notificationStartStream.next(data);
    } else if (methodName === Verbs.sendInputs) {
      store.dispatch(updateResourceId(data.resourceId));
    } else if (methodName === Verbs.sendData) {
      this.operationStream.next(data);
    }
  }
  private packageData(data: any) {
    data.frameId = this.frameId;
    return JSON.stringify(data);
  }
}
