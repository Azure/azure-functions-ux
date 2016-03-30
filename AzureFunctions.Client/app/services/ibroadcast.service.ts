import {EventEmitter} from 'angular2/core';
import {Subscription} from 'rxjs/Rx';
import {FunctionInfo} from '../models/function-info';

export abstract class IBroadcastService {
    abstract subscribe<T>(eventType: BroadcastEvent, callback: (obj?: T) => void, errorCallback?: (obj: any) => void, completedCallback?: (obj: any) => void): Subscription;
    abstract broadcast<T>(eventType: BroadcastEvent, obj?: T): void;
    abstract setBusyState();
    abstract clearBusyState();
    abstract setDirtyState(reason?: string);
    abstract clearDirtyState(reason?: string, all?: boolean);
    abstract clearAllDirtyStates();
    abstract getDirtyState(reason?: string): boolean;
}

export enum BroadcastEvent {
    FunctionDeleted,
    FunctionAdded,
    FunctionSelected,
    BusyState,
    TutorialStep,
    IntegrateChanged,
    Error
}