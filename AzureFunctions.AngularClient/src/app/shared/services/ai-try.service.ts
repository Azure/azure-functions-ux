import { AiService } from './ai.service';
import { Guid } from './../Utilities/Guid';
import { Injectable } from '@angular/core';


@Injectable()
export class AiTryService extends AiService {
    private _tryTraceStartTimes: { [name: string]: number } = {};

    constructor() {
        super();
    }

    setSessionId(_: string, __?: number) { }


    startTrace(): string {
        const traceKey = Guid.newTinyGuid();
        this._tryTraceStartTimes[traceKey] = Date.now();
        return traceKey;
    }

    stopTrace(name: string, traceKey: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {

        const eventStart = this._tryTraceStartTimes[traceKey];
        if (eventStart) {
            delete this._tryTraceStartTimes[traceKey];

            const duration = Date.now() - eventStart;
            properties = !!properties ? properties : {};
            properties['duration'] = duration + '';

            this.trackEvent(name, properties, measurements);
        }
    }

    trackDependency() { }

    trackException() { }

    trackTrace() { }


    flush() { }

    clearAuthenticatedUserContext() { }

    downloadAndSetup(): void { }

    _onerror() { }
}
