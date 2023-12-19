import { BatchUpdateSettings, BatchResponseItemEx } from './models/batch-models';
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
  CheckPermissionRequest,
  CheckPermissionResponse,
  CheckLockRequest,
  CheckLockResponse,
  LockType,
  PortalDebugInformation,
  FrameBladeParams,
  PortalTheme,
  IFeatureInfo,
  HighContrastTheme,
  ISwitchMenuItemInfo,
} from './models/portal-models';
import { ISubscription } from './models/subscription';
import { darkTheme } from './theme/dark';
import { lightTheme } from './theme/light';
import { blackHighContrast } from './theme/blackHighContrast';
import { whiteHighContrast } from './theme/whiteHighContrast';
import { Guid } from './utils/Guid';
import Url from './utils/url';
import { Dispatch, SetStateAction } from 'react';
import { ThemeExtended } from './theme/SemanticColorsExtended';
import { sendHttpRequest, getJsonHeaders } from './ApiHelpers/HttpClient';
import { TelemetryInfo } from './models/telemetry';
import { loadTheme } from '@fluentui/style-utilities';
import { NetAjaxSettings } from './models/ajax-request-model';
import { isPortalCommunicationStatusSuccess } from './utils/portal-utils';

export default class PortalCommunicator {
  public static shellSrc: string;
  private static portalSignature = 'FxAppBlade';
  private static portalSignatureFrameBlade = 'FxFrameBlade';
  private static portalSignatureFrameControl = 'FxFrameControl';
  private static acceptedSignatures = [
    PortalCommunicator.portalSignature,
    PortalCommunicator.portalSignatureFrameBlade,
    PortalCommunicator.portalSignatureFrameControl,
  ];
  private acceptedOriginsSuffix = [
    'portal.azure.com',
    'portal.microsoftazure.de',
    'portal.azure.cn',
    'portal.azure.us',
    'portal.azure.eaglex.ic.gov',
    'portal.azure.microsoft.scloud',
    'portal.azure.net',
  ];

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
    } else if (Url.getParameterByName(null, 'appsvc.bladetype') === 'framecontrol') {
      const innerDataJson = data ? JSON.parse(data) : null;
      window.parent.postMessage(
        {
          data: { data: innerDataJson, kind: verb },
          kind: verb,
          signature: this.portalSignatureFrameControl,
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
  public currentContrast: number;
  private operationStream = new Subject<IDataMessage<any>>();
  private notificationStartStream = new Subject<INotificationStartedInfo>();
  private frameId;
  private i18n: any;
  private setTheme: Dispatch<SetStateAction<ThemeExtended>>;
  private setStartupInfo: Dispatch<SetStateAction<IStartupInfo<any>>>;
  private setUpdatedInputs: Dispatch<IFeatureInfo<any>>;
  public initializeIframe(
    setTheme: Dispatch<SetStateAction<ThemeExtended>>,
    setStartupInfo: Dispatch<SetStateAction<IStartupInfo<any>>>,
    setUpdatedInputs: Dispatch<IFeatureInfo<any>>,
    i18n: any = null
  ): void {
    this.frameId = Url.getParameterByName(null, 'frameId');
    this.i18n = i18n;
    this.setTheme = setTheme;
    this.setStartupInfo = setStartupInfo;
    this.setUpdatedInputs = setUpdatedInputs;
    window.addEventListener(Verbs.message, this.iframeReceivedMsg.bind(this) as any, false);
    window.updateAuthToken = this.getAdToken.bind(this);
    const shellUrl = decodeURI(window.location.href);
    const shellSrc = Url.getParameterByName(shellUrl, 'trustedAuthority') || '';
    PortalCommunicator.shellSrc = shellSrc;
    if (shellSrc) {
      const startupInfo = {
        iframeHostName: '',
        iframeAppName: '',
      };

      window.appsvc = {
        version: '',
        sessionId: '',
        env: {
          hostName: '',
          appName: '',
          azureResourceManagerEndpoint: '',
          runtimeType: 'Azure',
        },
      };

      this.getDebugInformation()
        .then(response => {
          if (response.metadata.success && response.data) {
            const version = response.data.version;

            //NOTE(krmitta): Please don't remove this log statement, this is needed for testing and verification purposes.
            console.log(`Fusion Version: ${version}`);

            startupInfo.iframeHostName = response.data.hostName;
            startupInfo.iframeAppName = response.data.appName;
            window.appsvc = {
              version: version,
              sessionId: '',
              env: {
                hostName: response.data.hostName,
                appName: response.data.appName,
                azureResourceManagerEndpoint: '',
                runtimeType: 'Azure',
              },
            };
          }
          this.postInitializeMessage(startupInfo);
        })
        .catch(() => {
          this.postInitializeMessage(startupInfo);
        });
    }
  }

  public openBlade<T, U = any>(bladeInfo: IOpenBladeInfo<U>): Promise<IBladeResult<T>> {
    const payload: IDataMessage<IOpenBladeInfo<U>> = {
      operationId: Guid.newGuid(),
      data: bladeInfo,
    };

    PortalCommunicator.postMessage(Verbs.openBlade2, this.packageData(payload));
    return new Promise(resolve => {
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

  public switchMenuItem(menuItemInfo: ISwitchMenuItemInfo) {
    const payload: IDataMessage<ISwitchMenuItemInfo> = {
      operationId: Guid.newGuid(),
      data: menuItemInfo,
    };

    PortalCommunicator.postMessage(Verbs.switchMenuItem, this.packageData(payload));
  }

  public openFrameBlade<T, U = any>(bladeInfo: IOpenBladeInfo<FrameBladeParams<U>>): Promise<IBladeResult<T>> {
    return this.openBlade(bladeInfo);
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

  public makeHttpRequestsViaPortal(query: NetAjaxSettings, setContentType = false): Promise<IDataMessageResult<any>> {
    const updatedQuery = { ...query };

    let contentType: string | undefined;
    if (setContentType) {
      // Set `query.contentType` to `Content-Type` header value if set.
      contentType = setContentTypeIfContentTypeHeaderExists(updatedQuery);
    }

    // NOTE(krmitta): Make sure stringified data is sent if present
    // Do not stringify `query.data` if `setContentType` set and `contentType` starts with `application/json`
    if (query.data && (!contentType || !/^application\/json/i.test(contentType))) {
      updatedQuery.data = JSON.stringify(query.data);
    }

    const payload: IDataMessage<NetAjaxSettings> = {
      operationId: Guid.newGuid(),
      data: updatedQuery,
    };

    PortalCommunicator.postMessage(Verbs.httpRequest, this.packageData(payload));
    return new Promise(resolve => {
      this.operationStream
        .pipe(
          filter(o => o.operationId === payload.operationId),
          first()
        )
        .subscribe((r: IDataMessage<IDataMessageResult<any>>) => {
          resolve(r.data);
        });
    });
  }

  public hasFlightEnabled(flightName: string): Promise<boolean> {
    const payload: IDataMessage<string> = {
      operationId: Guid.newGuid(),
      data: flightName,
    };

    PortalCommunicator.postMessage(Verbs.ibizaExperimentationFlighting, this.packageData(payload));
    return new Promise(resolve => {
      this.operationStream
        .pipe(
          filter(o => o.operationId === payload.operationId),
          first()
        )
        .subscribe((r: IDataMessage<IDataMessageResult<boolean>>) => {
          resolve(r.data.result);
        });
    });
  }

  public getBooleanFlight(variableName: string): Promise<boolean> {
    const payload: IDataMessage<string> = {
      operationId: Guid.newGuid(),
      data: variableName,
    };

    PortalCommunicator.postMessage(Verbs.ibizaExperimentationFlightingFeatureGate, this.packageData(payload));
    return new Promise(resolve => {
      this.operationStream
        .pipe(
          filter(o => o.operationId === payload.operationId),
          first()
        )
        .subscribe((r: IDataMessage<IDataMessageResult<boolean>>) => {
          resolve(r.data.result);
        });
    });
  }

  public getSubscription(subscriptionId: string): Promise<ISubscription> {
    const payload: IDataMessage<ISubscriptionRequest> = {
      operationId: Guid.newGuid(),
      data: {
        subscriptionId,
      },
    };

    PortalCommunicator.postMessage(Verbs.getSubscriptionInfo, this.packageData(payload));
    return new Promise(resolve => {
      this.operationStream
        .pipe(
          filter(o => o.operationId === payload.operationId),
          first()
        )
        .subscribe((r: IDataMessage<IDataMessageResult<ISubscription>>) => {
          resolve(r.data.result);
        });
    });
  }

  public getAllSubscriptions(): Observable<ISubscription[]> {
    const payload: IDataMessage<any> = {
      operationId: Guid.newGuid(),
      data: {},
    };

    PortalCommunicator.postMessage(Verbs.getAllSubscriptions, this.packageData(payload));
    return this.operationStream.pipe(
      filter(o => o.operationId === payload.operationId),
      first(),
      map((r: IDataMessage<IDataMessageResult<ISubscription[]>>) => {
        return r.data.result;
      })
    );
  }

  public closeBlades() {
    PortalCommunicator.postMessage(Verbs.closeBlades, this.packageData({}));
  }

  public closeSelf(data?: string) {
    PortalCommunicator.postMessage(Verbs.closeSelf, this.packageData({ data }));
  }

  public updateBladeInfo(title: string, subtitle: string) {
    const payload: IUpdateBladeInfo = {
      title,
      subtitle,
    };

    PortalCommunicator.postMessage(Verbs.updateBladeInfo, this.packageData(payload));
  }

  public loadComplete() {
    PortalCommunicator.postMessage(Verbs.loadComplete, this.packageData({}));
  }

  public xtermReady() {
    PortalCommunicator.postMessage(Verbs.xtermReady, this.packageData({}));
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

  public log(info: TelemetryInfo) {
    const infoStr = this.packageData(info);
    PortalCommunicator.postMessage(Verbs.log, infoStr);
  }

  public logMessageDeprecated(level: LogEntryLevel, message: string, ...restArgs: any[]) {
    const messageStr = this.packageData({
      level,
      message,
      restArgs,
    });
    PortalCommunicator.postMessage(Verbs.logMessageDeprecated, messageStr);
  }

  public logActionDeprecated(subcomponent: string, action: string, data?: { [name: string]: string }): void {
    const actionStr = this.packageData({
      subcomponent,
      action,
      data,
    });
    PortalCommunicator.postMessage(Verbs.logActionDeprecated, actionStr);
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
          if (isPortalCommunicationStatusSuccess(o.data.status)) {
            resolve(o.data.result.token);
          } else {
            return reject();
          }
        });
    });
  }

  public executeArmUpdateRequest<T>(request: BatchUpdateSettings): Promise<BatchResponseItemEx<T>> {
    const operationId = Guid.newGuid();

    const payload: IDataMessage<BatchUpdateSettings> = {
      operationId,
      data: request,
    };

    PortalCommunicator.postMessage(Verbs.executeArmUpdateRequest, this.packageData(payload));
    return new Promise(resolve => {
      this.operationStream
        .pipe(
          filter(o => o.operationId === operationId),
          first()
        )
        .subscribe((o: IDataMessage<IDataMessageResult<BatchResponseItemEx<T>>>) => {
          resolve(o.data.result);
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

  public hasPermission(resourceId: string, actions: string[]): Promise<boolean> {
    const operationId = Guid.newGuid();

    const payload: IDataMessage<CheckPermissionRequest> = {
      operationId,
      data: {
        resourceId,
        actions,
      },
    };

    PortalCommunicator.postMessage(Verbs.hasPermission, this.packageData(payload));
    return new Promise(resolve => {
      this.operationStream
        .pipe(
          filter(o => o.operationId === operationId),
          first()
        )
        .subscribe((o: IDataMessage<IDataMessageResult<CheckPermissionResponse>>) => {
          if (!isPortalCommunicationStatusSuccess(o.data.status)) {
            this.log({
              action: 'hasPermission',
              actionModifier: 'failed',
              resourceId,
              logLevel: 'error',
              data: {
                message: 'Failed to check for permissions',
                actions,
              },
            });
          }

          resolve(o.data.result.hasPermission);
        });
    });
  }

  public hasLock(resourceId: string, type: LockType): Promise<boolean> {
    const operationId = Guid.newGuid();

    const payload: IDataMessage<CheckLockRequest> = {
      operationId,
      data: {
        resourceId,
        type,
      },
    };

    PortalCommunicator.postMessage(Verbs.hasLock, this.packageData(payload));
    return new Promise(resolve => {
      this.operationStream
        .pipe(
          filter(o => o.operationId === operationId),
          first()
        )
        .subscribe((o: IDataMessage<IDataMessageResult<CheckLockResponse>>) => {
          if (!isPortalCommunicationStatusSuccess(o.data.status)) {
            this.log({
              action: 'hasLock',
              actionModifier: 'failed',
              resourceId,
              logLevel: 'error',
              data: {
                message: 'Failed to evaluate lock',
                type,
              },
            });
          }

          resolve(o.data.result.hasLock);
        });
    });
  }

  private iframeReceivedMsg(event: IEvent): void {
    if (!event || !event.data) {
      return;
    }

    if (event.data.data && event.data.data.frameId && event.data.data.frameId !== this.frameId) {
      return;
    }

    if (
      window.appsvc &&
      window.appsvc.env.runtimeType !== 'OnPrem' &&
      !this.acceptedOriginsSuffix.find(o => event.origin.toLowerCase().endsWith(o.toLowerCase()))
    ) {
      return;
    }

    if (!PortalCommunicator.acceptedSignatures.find(s => event.data.signature !== s)) {
      return;
    }

    const data = event.data.data;
    const methodName = event.data.kind;

    this.log({
      action: 'iframeMessage',
      actionModifier: 'receivedFromHost',
      resourceId: window.appsvc && window.appsvc.resourceId ? window.appsvc.resourceId : '',
      logLevel: 'verbose',
      data: {
        methodName: methodName,
        frameId: event.data.data && event.data.data.frameId,
      },
    });

    if (methodName === Verbs.sendStartupInfo) {
      const startupInfo = data as IStartupInfo<any>;
      if (this.currentTheme !== startupInfo.theme || this.currentContrast !== startupInfo.highContrastKey) {
        const newTheme =
          startupInfo.highContrastKey === HighContrastTheme.Black
            ? blackHighContrast
            : startupInfo.highContrastKey === HighContrastTheme.White
            ? whiteHighContrast
            : startupInfo.theme === PortalTheme.dark
            ? darkTheme
            : lightTheme;

        loadTheme(newTheme);
        this.setTheme(newTheme as ThemeExtended);
        this.currentTheme = startupInfo.theme;
        this.currentContrast = startupInfo.highContrastKey;
      }
      this.setArmEndpointInternal(startupInfo.armEndpoint);
      this.setArmTokenInternal(startupInfo.token);
      this.i18n.changeLanguage(startupInfo.effectiveLocale);
      this.setStartupInfo(startupInfo);

      if (window.appsvc) {
        window.appsvc.sessionId = startupInfo.sessionId;
        window.appsvc.env.azureResourceManagerEndpoint = startupInfo.armEndpoint;
        window.appsvc.resourceId = startupInfo.resourceId;
        window.appsvc.feature = startupInfo.featureInfo && startupInfo.featureInfo.feature;
        window.appsvc.frameId = this.frameId;
      }
    } else if (methodName === Verbs.sendToken2) {
      this.setArmTokenInternal(data && data.token);
    } else if (methodName === Verbs.sendNotificationStarted) {
      this.notificationStartStream.next(data);
    } else if (methodName === Verbs.sendData) {
      this.operationStream.next(data);
    } else if (methodName === Verbs.sendUpdatedInputs) {
      this.setUpdatedInputs(data);
    }
  }

  private setArmTokenInternal = (token: string) => {
    if (window.appsvc && window.appsvc.env && !!token && window.appsvc.env.armToken !== token) {
      window.appsvc.env.armToken = token;
    }
  };

  private setArmEndpointInternal = (endpoint: string) => {
    if (window.appsvc && window.appsvc.env.azureResourceManagerEndpoint) {
      window.appsvc.env.azureResourceManagerEndpoint = endpoint;
    }
  };

  private packageData = (data: any) => {
    data.frameId = this.frameId;
    return JSON.stringify(data);
  };

  private getDebugInformation = () => {
    return sendHttpRequest<PortalDebugInformation>({
      url: '/api/debug',
      method: 'GET',
      headers: getJsonHeaders(),
    });
  };

  private postInitializeMessage = (startupInfo: any) => {
    // This is a required message. It tells the shell that your iframe is ready to receive messages.
    PortalCommunicator.postMessage(Verbs.ready, null);
    PortalCommunicator.postMessage(Verbs.initializationcomplete, null);
    PortalCommunicator.postMessage(Verbs.getStartupInfo, this.packageData(startupInfo));
  };
}

function setContentTypeIfContentTypeHeaderExists(query: NetAjaxSettings): string | undefined {
  if (query.headers) {
    const contentTypeHeaderKey = Object.keys(query.headers).find(key => /content-type/i.test(key));

    if (contentTypeHeaderKey) {
      const contentType = query.headers[contentTypeHeaderKey];

      query.contentType = contentType;
      return contentType;
    }
  }

  return undefined;
}
