import { Injectable } from '@angular/core';

declare var mixpanel: any;


@Injectable()
export class TelemetryService {
    track(_: string, properties?: any) {
        if (typeof mixpanel !== 'undefined') {
            properties = properties || {};
            properties.sitename = 'azurefunctions';
            mixpanel.track(name, properties);
        }
    }
}