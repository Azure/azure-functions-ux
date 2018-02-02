import { LogService } from 'app/shared/services/log.service';
import { PortalService } from './portal.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { LogCategories } from 'app/shared/models/constants';

interface ComponentMap {
    [key: string]: string;
}

@Injectable()
export class TelemetryService {

    private _featureMap: { [key: string]: ComponentMap } = {};

    private readonly _loadingIdFormat = '/feature/{0}/loading';
    private readonly _debouceTimeMs = 250;

    constructor(
        private _portalService: PortalService,
        private _logService: LogService) {
    }

    public featureLoading(featureName: string, componentName: string) {
        if (!this._featureMap[featureName]) {
            this._featureMap[featureName] = {};

            this._logService.verbose(LogCategories.telemetry, `Feature loading started. feature: ${featureName}`);

            this._portalService.sendTimerEvent({
                timerId: this._loadingIdFormat.format(featureName),
                timerAction: 'start'
            });
        }

        this._logService.verbose(
            LogCategories.telemetry,
            `Loading feature: ${featureName}, component: ${componentName}`);

        this._featureMap[featureName][componentName] = componentName;
    }

    public featureLoadingComplete(featureName: string, componentName: string) {
        if (!this._featureMap[featureName] || !this._featureMap[featureName][componentName]) {
            return;
        }

        delete this._featureMap[featureName][componentName];

        this._logService.verbose(
            LogCategories.telemetry,
            `Component is done loading.  feature: ${featureName}, component: ${componentName}`);

        if (Object.keys(this._featureMap[featureName]).length === 0) {

            this._logService.verbose(
                LogCategories.telemetry,
                `All components should be complete for: ${featureName}.  Debouncing for ${this._debouceTimeMs}ms`);

            // "Debouncing" any straggling signals.  We need to do this it's possible that on completion of
            // a parent component, new child components may be created from the result of conditional statements
            // becoming true.  In that case, the child components will start to emit feature loading events, so we
            // need to wait for things to settle down.
            Observable.timer(this._debouceTimeMs)
                .subscribe(() => {
                    if (this._featureMap[featureName] && Object.keys(this._featureMap[featureName]).length === 0) {

                        this._logService.verbose(LogCategories.telemetry, `Completing load for feature: ${featureName}`);
                        delete this._featureMap[featureName];
                        this._portalService.sendTimerEvent({
                            timerId: this._loadingIdFormat.format(featureName),
                            timerAction: 'stop'
                        });
                    } else {
                        this._logService.verbose(LogCategories.telemetry, `New loading signals detected for feature: ${featureName}`);
                    }
                });
        }
    }
}