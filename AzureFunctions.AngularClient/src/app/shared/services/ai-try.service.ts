import { AiService } from './ai.service';
import { Guid } from './../Utilities/Guid';
import { Injectable } from '@angular/core';

declare var mixpanel: any;

function MixPanelDefined() {
    return (_: Object, __: string, descriptor: TypedPropertyDescriptor<any>) => {
        const originalMethod = descriptor.value;
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
    private _tryTraceStartTimes: { [name: string]: number } = {};

    constructor() {
        super();
    }

    setSessionId(_: string, __?: number) { }

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
    trackPageView(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, _?: number) {
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

    @MixPanelDefined()
    trackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        mixpanel.track(name, { properties: this.addMixPanelProperties(properties), measurements: measurements });
    }

    @MixPanelDefined()
    trackLinkClick(name: string, expired: string, _?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        mixpanel.track(name, { expired: expired, properties: this.addMixPanelProperties(null), measurements: measurements });
    }

    trackDependency() { }

    trackException() { }

    @MixPanelDefined()
    trackMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: { [name: string]: string; }) {
        mixpanel.track(name, { average: average, sampleCount: sampleCount, min: min, max: max, properties: this.addMixPanelProperties(properties) });
    }

    trackTrace() { }


    flush() { }

    @MixPanelDefined()
    setAuthenticatedUserContext(authenticatedUserId: string, _?: string) {
        const userDetails = authenticatedUserId.split('#');
        if (userDetails.length === 2) {
            mixpanel.alias(userDetails[1]);
        } else {
            mixpanel.alias(authenticatedUserId);
        }
    }

    clearAuthenticatedUserContext() { }

    downloadAndSetup(): void { }

    _onerror() { }
}
