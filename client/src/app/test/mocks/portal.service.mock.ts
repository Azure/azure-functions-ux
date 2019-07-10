import { Injectable } from '@angular/core';
import {
  TimerEvent,
  OpenBladeInfo,
  DataMessage,
  PinPartInfo,
  LogEntryLevel,
  NotificationStartedInfo,
  TokenType,
} from '../../shared/models/portal';
import { Subject } from 'rxjs/Subject';
import { SpecCostQueryInput, SpecCostQueryResult } from '../../site/spec-picker/price-spec-manager/billing-models';
import { Observable } from 'rxjs/Observable';
import { Subscription } from '../../shared/models/subscription';

@Injectable()
export class MockPortalService {
  public operationStream = new Subject<DataMessage<any>>();

  constructor() {}

  getStartupInfo() {}

  sendTimerEvent(evt: TimerEvent) {}

  openBladeDeprecated(bladeInfo: OpenBladeInfo, source: string) {}

  // Returns an Observable which resolves when blade is close.
  // Optionally may also return a value
  openBlade(bladeInfo: OpenBladeInfo, source: string) {}

  openCollectorBlade(resourceId: string, name: string, source: string, getAppSettingCallback: (appSettingName: string) => void): void {}

  openCollectorBladeWithInputs(
    resourceId: string,
    obj: any,
    source: string,
    getAppSettingCallback: (appSettingName: string) => void,
    bladeName?: string
  ) {}

  getAdToken(tokenType: TokenType) {}

  getSpecCosts(query: SpecCostQueryInput): Observable<SpecCostQueryResult> {
    return null;
  }

  getSubscription(subscriptionId: string): Observable<Subscription> {
    return null;
  }

  closeBlades() {}

  updateBladeInfo(title: string, subtitle: string) {}

  pinPart(pinPartInfo: PinPartInfo) {}

  startNotification(title: string, description: string): Observable<NotificationStartedInfo> {
    return Observable.of({
      id: 'notid',
    });
  }

  stopNotification(id: string, success: boolean, description: string) {}

  logAction(subcomponent: string, action: string, data?: any): void {}

  setDirtyState(dirty: boolean): void {}

  updateDirtyState(dirty: boolean, message?: string): void {}

  logMessage(level: LogEntryLevel, message: string, ...restArgs: any[]) {}

  returnPcv3Results<T>(results: T) {}
}
