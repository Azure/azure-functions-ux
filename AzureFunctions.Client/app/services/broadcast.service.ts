import {Injectable, EventEmitter} from 'angular2/core';
import {IBroadcastService, BroadcastEvent} from './ibroadcast.service';
import {Observable, Subscription} from 'rxjs/Rx';
import {FunctionInfo} from '../models/function-info';

@Injectable()
export class BroadcastService implements IBroadcastService {
    private functionDeletedEvent: EventEmitter<FunctionInfo>;
    private functionAddedEvent: EventEmitter<FunctionInfo>;
    private functionSelectedEvent: EventEmitter<FunctionInfo>;
    private busyStateEvent: EventEmitter<boolean>;

    constructor() {
        this.functionDeletedEvent = new EventEmitter<FunctionInfo>();
        this.functionAddedEvent = new EventEmitter<FunctionInfo>();
        this.functionSelectedEvent = new EventEmitter<FunctionInfo>();
        this.busyStateEvent = new EventEmitter<boolean>();
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
        }
    }
}