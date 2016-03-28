import {Injectable} from 'angular2/core';

declare var mixpanel: any;


@Injectable()
export class TelemetryService {
    track(eventName: string, properties?: any) {
        if (mixpanel) {
            properties = properties || {};
            properties.sitename = 'azurefunctions';
            mixpanel.track(name, properties);
        }
    }
}