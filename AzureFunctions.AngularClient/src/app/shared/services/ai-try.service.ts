import { AiService } from './ai.service';
import { Guid } from './../Utilities/Guid';
import { Injectable } from '@angular/core';
import { IConfig, SeverityLevel } from '../models/app-insights';

declare var mixpanel: any;

function MixPanelDefined() {
    return (target: Object, functionName: string, descriptor: TypedPropertyDescriptor<any>) => {
        let originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            if (typeof (mixpanel) !== 'undefined') {
                return originalMethod.apply(this, args);
            } else {
                return null;
            }
        };
        return descriptor;
    };
}

@Injectable()
export class AiTryService extends AiService {
    private _tryTraceStartTimes: {[name: string]: number} = {};

    constructor() {
      super();
    }

    setSessionId(sessionId: string, count?: number) { }

    @MixPanelDefined()
    startTrackPage(name?: string) {
        mixpanel.track('Functions Start Page View', { page: name, properties: this.addMixPanelProperties(null) });
    }

    addMixPanelProperties(properties?) {
        properties = properties || {};
        properties['sitename'] = 'functions';
    }

    @MixPanelDefined()
    stopTrackPage(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        mixpanel.track('Functions Stop Page View', { page: name, url: url, properties: this.addMixPanelProperties(properties), measurements: measurements });
    }

    @MixPanelDefined()
    trackPageView(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, duration?: number) {
        mixpanel.track('Functions Page Viewed', { page: name, url: url, properties: this.addMixPanelProperties(properties), measurements: measurements });
    }

    @MixPanelDefined()
    startTrackEvent(name: string) {
        mixpanel.track(name);
    }

    @MixPanelDefined()
    stopTrackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        mixpanel.track(name, { properties: this.addMixPanelProperties(properties), measurements: measurements });
    }

    startTrace(): string {
        let traceKey = Guid.newTinyGuid();
        this._tryTraceStartTimes[traceKey] = Date.now();
        return traceKey;
    }

    stopTrace(name: string, traceKey: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {

        let eventStart = this._tryTraceStartTimes[traceKey];
        if (eventStart) {
            delete this._tryTraceStartTimes[traceKey];

            let duration = Date.now() - eventStart;
            properties = !!properties ? properties : {};
            properties['duration'] = duration + '';

            this.trackEvent(name, properties, measurements);
        }
    }

    @MixPanelDefined()
    trackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        mixpanel.track(name, { properties: this.addMixPanelProperties(properties), measurements: measurements });
    }

    @MixPanelDefined()
    trackLinkClick(name: string, expired: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        mixpanel.track(name, { expired: expired, properties: this.addMixPanelProperties(null), measurements: measurements });
    }

    trackDependency(id: string, method: string, absoluteUrl: string, pathName: string, totalTime: number, success: boolean, resultCode: number) { }

    trackException(exception: Error, handledAt?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, severityLevel?: SeverityLevel) { }

    @MixPanelDefined()
    trackMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: { [name: string]: string; }) {
        mixpanel.track(name, { average: average, sampleCount: sampleCount, min: min, max: max, properties: this.addMixPanelProperties(properties) });
    }

    trackTrace(message: string, properties?: { [name: string]: string; }) { }


    flush() { }

    @MixPanelDefined()
    setAuthenticatedUserContext(authenticatedUserId: string, accountId?: string) {
        let userDetails = authenticatedUserId.split('#');
        if (userDetails.length === 2) {
            mixpanel.alias(userDetails[1]);
        } else {
            mixpanel.alias(authenticatedUserId);
        }
    }

    clearAuthenticatedUserContext() { }

    downloadAndSetup(config: IConfig): void { }

    _onerror(message: string, url: string, lineNumber: number, columnNumber: number, error: Error) { }
}
