import { LogCategories } from './../models/constants';
import { LogService } from 'app/shared/services/log.service';
import { PortalService } from './portal.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

interface ComponentMap {
  [key: string]: string;
}

@Injectable()
export class TelemetryService {
  // Keeps track of which features are currently being loaded.
  private _featureMap: { [key: string]: ComponentMap } = {};

  // Keeps track to make sure that no feature gets logged without a parent
  // being logged first.  This is to help enforce that someone writing a new
  // feature properly defines a parent component
  private _registeredParentFeatures: { [key: string]: string } = {};

  private readonly _constructIdFormat = '/feature/{0}/construct';
  private readonly _loadingIdFormat = '/feature/{0}/loading';
  private readonly _debouceTimeMs = 250;

  constructor(private _portalService: PortalService, private _logService: LogService) {}

  public featureConstructComplete(featureName: string) {
    if (!featureName) {
      return;
    }

    // For now, this will only be started for Ibiza menu scenario's.
    this._portalService.sendTimerEvent({
      timerId: this._constructIdFormat.format(featureName),
      timerAction: 'stop',
    });
  }

  public featureLoading(isParentComponent: boolean, featureName: string, componentName: string) {
    // If the inputs on a parent component have changed, then we should reset timers
    if (isParentComponent && this._featureMap[featureName]) {
      delete this._featureMap[featureName];
    }

    if (!this._featureMap[featureName]) {
      if (isParentComponent) {
        this._registeredParentFeatures[featureName] = featureName;
        this._featureMap[featureName] = {};

        this._logService.verbose(LogCategories.telemetry, `Feature loading started. feature: ${featureName}`);

        this._portalService.sendTimerEvent({
          timerId: this._loadingIdFormat.format(featureName),
          timerAction: 'start',
        });
      } else if (!this._registeredParentFeatures[featureName]) {
        const errMesg = `No parentComponent defined for feature: ${featureName}, component: ${componentName}.  
Exactly one parent component must be defined for a given feature by setting the isParentComponent property.`;

        // There needs to be one parent component which represents timing for the entire feature.
        // Otherwise if one child component is used independently of a parent component and start/stops
        // it's timer, our load times would be completely off.
        this._logService.error(LogCategories.telemetry, '/no-parent-component-defined', errMesg);
        throw Error(errMesg);
      } else {
        // This can happen if a feature has already been loaded, but there's child components that get created
        // after the initial loading
        this._logService.verbose(
          LogCategories.telemetry,
          `A child component started after feature load complete.  feature: ${featureName}, component: ${componentName}`
        );
        return;
      }
    }

    this._logService.verbose(LogCategories.telemetry, `Loading feature: ${featureName}, component: ${componentName}`);

    this._featureMap[featureName][componentName] = componentName;
  }

  public featureLoadingComplete(featureName: string, componentName: string) {
    if (!this._featureMap[featureName] || !this._featureMap[featureName][componentName]) {
      return;
    }

    delete this._featureMap[featureName][componentName];

    this._logService.verbose(LogCategories.telemetry, `Component is done loading.  feature: ${featureName}, component: ${componentName}`);

    if (Object.keys(this._featureMap[featureName]).length === 0) {
      this._logService.verbose(
        LogCategories.telemetry,
        `All components should be complete for: ${featureName}.  Debouncing for ${this._debouceTimeMs}ms`
      );

      // "Debouncing" any straggling signals.  We need to do this it's possible that on completion of
      // a parent component, new child components may be created from the result of conditional statements
      // becoming true.  In that case, the child components will start to emit feature loading events, so we
      // need to wait for things to settle down.
      Observable.timer(this._debouceTimeMs).subscribe(() => {
        if (this._featureMap[featureName] && Object.keys(this._featureMap[featureName]).length === 0) {
          this._logService.verbose(LogCategories.telemetry, `Completing load for feature: ${featureName}`);
          delete this._featureMap[featureName];
          this._portalService.sendTimerEvent({
            timerId: this._loadingIdFormat.format(featureName),
            timerAction: 'stop',
          });
        } else {
          this._logService.verbose(LogCategories.telemetry, `New loading signals detected for feature: ${featureName}`);
        }
      });
    }
  }
}
