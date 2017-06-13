import {Injectable, EventEmitter} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { FunctionInfo } from '../models/function-info';
import {ApiProxy} from '../models/api-proxy';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {ErrorEvent} from '../models/error-event';
import {BroadcastEvent} from '../models/broadcast-event';

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
    private versionUpdated: EventEmitter<void>;
    private trialExpired: EventEmitter<void>;
    private resetKeySelection: EventEmitter<FunctionInfo>;
    private refreshPortal: EventEmitter<void>;
    private apiProxyAddedEvent: EventEmitter<ApiProxy>;
    private apiProxyDeletedEvent: EventEmitter<ApiProxy>;
    private apiProxySelectedEvent: EventEmitter<ApiProxy>;
    private apiProxyUpdatedEvent: EventEmitter<ApiProxy>;
    private clearErrorEvent: EventEmitter<string>;
    private dirtyStateMap: { [key: string]: number } = {};
    private defaultDirtyReason = 'global';

    constructor() {
        this.functionDeletedEvent = new EventEmitter<FunctionInfo>();
        this.functionAddedEvent = new EventEmitter<FunctionInfo>();
        this.functionSelectedEvent = new EventEmitter<FunctionInfo>();
        this.functionUpdatedEvent = new EventEmitter<FunctionInfo>();
        this.tutorialStepEvent = new EventEmitter<TutorialEvent>();
        this.integrateChangedEvent = new EventEmitter<void>();
        this.errorEvent = new EventEmitter<ErrorEvent>();
        this.versionUpdated = new EventEmitter<void>();
        this.trialExpired = new EventEmitter<void>();
        this.functionNewEvent = new EventEmitter<any>();
        this.resetKeySelection = new EventEmitter<FunctionInfo>();
        this.refreshPortal = new EventEmitter<void>();
        this.apiProxyAddedEvent = new EventEmitter<ApiProxy>();
        this.apiProxyDeletedEvent = new EventEmitter<ApiProxy>();
        this.apiProxySelectedEvent = new EventEmitter<ApiProxy>();
        this.apiProxyUpdatedEvent = new EventEmitter<ApiProxy>();
        this.clearErrorEvent = new EventEmitter<string>();
    }

    broadcast<T>(eventType: BroadcastEvent, obj?: T) {
        var emitter = <EventEmitter<T>>this.getEventEmitter(eventType);
        emitter.emit(obj);
    }

    subscribe<T>(eventType: BroadcastEvent, callback: (obj?: T) => void, errorCallback?: (obj: any) => void, completedCallback?: (obj: any) => void): Subscription {
        var emitter = <EventEmitter<T>>this.getEventEmitter(eventType);
        return emitter.subscribe(callback, errorCallback, completedCallback);
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

            case BroadcastEvent.FunctionUpdated:
                return this.functionUpdatedEvent;

            case BroadcastEvent.TutorialStep:
                return this.tutorialStepEvent;

            case BroadcastEvent.IntegrateChanged:
                return this.integrateChangedEvent;

            case BroadcastEvent.Error:
                return this.errorEvent;

            case BroadcastEvent.VersionUpdated:
                return this.versionUpdated;

            case BroadcastEvent.TrialExpired:
                return this.trialExpired;


            case BroadcastEvent.ResetKeySelection:
                return this.resetKeySelection;

            case BroadcastEvent.RefreshPortal:
                return this.refreshPortal;

            case BroadcastEvent.ClearError:
                return this.clearErrorEvent;
        }
    }
}
