import { Observable } from 'rxjs/Observable';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class MockBroadcastService {
  constructor() {}

  broadcast<T>(eventType: BroadcastEvent, obj?: T) {}

  subscribe<T>(
    eventType: BroadcastEvent,
    callback: (obj?: T) => void,
    errorCallback?: (obj: any) => void,
    completedCallback?: (obj: any) => void
  ): Subscription {
    return null;
  }

  broadcastEvent<T>(eventType: BroadcastEvent, obj?: T) {}

  getEvents<T>(eventType: BroadcastEvent): Observable<T> {
    return null;
  }

  setDirtyState(reason?: string) {}

  clearDirtyState(reason?: string, all?: boolean) {}

  getDirtyState(reason?: string) {}

  clearAllDirtyStates() {}
}
