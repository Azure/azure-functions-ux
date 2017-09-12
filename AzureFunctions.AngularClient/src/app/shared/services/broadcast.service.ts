import { Observable } from 'rxjs/Observable';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DirtyStateEvent } from './../models/broadcast-event';
import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { FunctionInfo } from '../models/function-info';
import { TutorialEvent } from '../models/tutorial';
import { ErrorEvent } from '../models/error-event';

interface EventInfo<T> {
    eventType: BroadcastEvent;
    obj: T;
}

@Injectable()
export class BroadcastService {
    private functionDeletedEvent: EventEmitter<FunctionInfo>;
    private functionAddedEvent: EventEmitter<FunctionInfo>;
    private functionSelectedEvent: EventEmitter<FunctionInfo>;
    private functionUpdatedEvent: EventEmitter<FunctionInfo>;
    private functionNewEvent: EventEmitter<any>;
    private integrateChangedEvent: EventEmitter<void>;
    private tutorialStepEvent: EventEmitter<TutorialEvent>;
    private errorEvent: EventEmitter<ErrorEvent>;
    private trialExpired: EventEmitter<void>;
    private resetKeySelection: EventEmitter<FunctionInfo>;
    private clearErrorEvent: EventEmitter<string>;
    private dirtyStateMap: { [key: string]: string } = {};
    private defaultDirtyReason = 'global';

    private replayEvent = new ReplaySubject<EventInfo<any>>(1);

    constructor() {
        this.functionDeletedEvent = new EventEmitter<FunctionInfo>();
        this.functionAddedEvent = new EventEmitter<FunctionInfo>();
        this.functionSelectedEvent = new EventEmitter<FunctionInfo>();
        this.functionUpdatedEvent = new EventEmitter<FunctionInfo>();
        this.tutorialStepEvent = new EventEmitter<TutorialEvent>();
        this.integrateChangedEvent = new EventEmitter<void>();
        this.errorEvent = new EventEmitter<ErrorEvent>();
        this.trialExpired = new EventEmitter<void>();
        this.functionNewEvent = new EventEmitter<any>();
        this.resetKeySelection = new EventEmitter<FunctionInfo>();
        this.clearErrorEvent = new EventEmitter<string>();
    }

    // DEPRECATED - Use broadcastEvent
    broadcast<T>(eventType: BroadcastEvent, obj?: T) {
        var emitter = <EventEmitter<T>>this.getEventEmitter(eventType);
        emitter.emit(obj);
    }

    // DEPRECATED - Use getEvents
    subscribe<T>(eventType: BroadcastEvent, callback: (obj?: T) => void, errorCallback?: (obj: any) => void, completedCallback?: (obj: any) => void): Subscription {
        var emitter = <EventEmitter<T>>this.getEventEmitter(eventType);
        return emitter.subscribe(callback, errorCallback, completedCallback);
    }

    broadcastEvent<T>(eventType: BroadcastEvent, obj?: T) {
        this.replayEvent.next({
            eventType: eventType,
            obj: obj
        });
    }

    getEvents<T>(eventType: BroadcastEvent): Observable<T> {
        return this.replayEvent
            .filter(e => e.eventType === eventType)
            .map(e => <T>e.obj);
    }

    setDirtyState(reason?: string) {
        this.broadcastEvent<DirtyStateEvent>(BroadcastEvent.DirtyStateChange, { dirty: true, reason: reason });

        reason = reason || this.defaultDirtyReason;
        this.dirtyStateMap[reason] = reason;
    }

    clearDirtyState(reason?: string, all?: boolean) {
        reason = reason || this.defaultDirtyReason;

        if (!this.dirtyStateMap[reason]) {
            return;
        }

        this.broadcastEvent<DirtyStateEvent>(BroadcastEvent.DirtyStateChange, { dirty: false, reason: reason });
        delete this.dirtyStateMap[reason];
    }

    getDirtyState(reason?: string) {
        if (reason) {
            return this.dirtyStateMap[reason];
        } else {
            return !this.isEmptyMap(this.dirtyStateMap);
        }
    }

    clearAllDirtyStates() {
        this.broadcastEvent<DirtyStateEvent>(BroadcastEvent.DirtyStateChange, { dirty: false, reason: null });
        this.dirtyStateMap = {};
    }

    // http://stackoverflow.com/a/20494546/3234163
    isEmptyMap(map: any): boolean {
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    getEventEmitter(eventType: BroadcastEvent): any {
        switch (eventType) {

            case BroadcastEvent.FunctionDeleted:
                return this.functionDeletedEvent;

            case BroadcastEvent.FunctionAdded:
                return this.functionAddedEvent;

            case BroadcastEvent.FunctionSelected:
                return this.functionSelectedEvent;

            case BroadcastEvent.FunctionUpdated:
                return this.functionUpdatedEvent;

            case BroadcastEvent.TutorialStep:
                return this.tutorialStepEvent;

            case BroadcastEvent.IntegrateChanged:
                return this.integrateChangedEvent;
            case BroadcastEvent.Error:
                return this.errorEvent;

            case BroadcastEvent.TrialExpired:
                return this.trialExpired;

            case BroadcastEvent.ResetKeySelection:
                return this.resetKeySelection;

            case BroadcastEvent.ClearError:
                return this.clearErrorEvent;


        }
    }
}
