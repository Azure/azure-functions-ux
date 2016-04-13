import {Injectable, EventEmitter} from 'angular2/core';
import {Observable, Subscription} from 'rxjs/Rx';
import {FunctionInfo} from '../models/function-info';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {ErrorEvent} from '../models/error-event';
import {BroadcastEvent} from '../models/broadcast-event';

@Injectable()
export class BroadcastService {
    private functionDeletedEvent: EventEmitter<FunctionInfo>;
    private functionAddedEvent: EventEmitter<FunctionInfo>;
    private functionSelectedEvent: EventEmitter<FunctionInfo>;
    private busyStateEvent: EventEmitter<boolean>;
    private integrateChnagedEvent: EventEmitter<void>;
    private tutorialStepEvent: EventEmitter<TutorialEvent>;
    private errorEvent: EventEmitter<ErrorEvent>;
    private dirtyStateMap: { [key: string]: number } = {};
    private defaultDirtyReason = 'global';

    constructor() {
        this.functionDeletedEvent = new EventEmitter<FunctionInfo>();
        this.functionAddedEvent = new EventEmitter<FunctionInfo>();
        this.functionSelectedEvent = new EventEmitter<FunctionInfo>();
        this.busyStateEvent = new EventEmitter<boolean>();
        this.tutorialStepEvent = new EventEmitter<TutorialEvent>();
        this.integrateChnagedEvent = new EventEmitter<void>();
        this.errorEvent = new EventEmitter<ErrorEvent>();
    }

    broadcast<T>(eventType: BroadcastEvent, obj?: T) {
        var emitter = <EventEmitter<T>>this.getEventEmitter(eventType);
        emitter.emit(obj);
    }

    subscribe<T>(eventType: BroadcastEvent, callback: (obj?: T) => void, errorCallback?: (obj: any) => void, completedCallback?: (obj: any) => void): Subscription {
        var emitter = <EventEmitter<T>>this.getEventEmitter(eventType);
        return emitter.subscribe(callback, errorCallback, completedCallback);
    }

    setBusyState() {
        this.busyStateEvent.emit(true);
    }

    clearBusyState() {
        this.busyStateEvent.emit(false);
    }

    setDirtyState(reason?: string) {
        reason = reason || this.defaultDirtyReason;
        if (this.dirtyStateMap[reason]) {
            this.dirtyStateMap[reason]++;
        } else {
            this.dirtyStateMap[reason] = 1;
        }
    }

    clearDirtyState(reason?: string, all?: boolean) {
        reason = reason || this.defaultDirtyReason;

        if (!this.dirtyStateMap[reason]) return;

        if (all) {
            delete this.dirtyStateMap[reason];
        } else {
            this.dirtyStateMap[reason]--;
        }
    }

    getDirtyState(reason?: string) {
        if (reason) {
            return (this.dirtyStateMap[reason] || 0) > 0;
        } else {
            return this.isEmptyMap(this.dirtyStateMap);
        }
    }

    clearAllDirtyStates() {
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

            case BroadcastEvent.BusyState:
                return this.busyStateEvent;

            case BroadcastEvent.TutorialStep:
                return this.tutorialStepEvent;

            case BroadcastEvent.IntegrateChanged:
                return this.integrateChnagedEvent;

            case BroadcastEvent.Error:
                return this.errorEvent;
        }
    }
}