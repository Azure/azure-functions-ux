import { LogService } from 'app/shared/services/log.service';
import { BusyStateName } from './../../busy-state/busy-state.component';
import { TelemetryService } from './../services/telemetry.service';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Injector } from '@angular/core/src/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { ErrorableComponent } from './errorable-component';
import { Input } from '@angular/core';
import { LogCategories } from 'app/shared/models/constants';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';

export abstract class FeatureComponent<T> extends ErrorableComponent implements OnDestroy {
    // The name of the feature this component is apart of.  Telemetry will
    // be collected for all features with the same name.
    @Input() featureName: string;

    // Specifies if this is the main parent component for the entire feature.
    // There should only be one parent component per feature
    isParentComponent = false;

    protected ngUnsubscribe: Subject<void>;

    private __inputEvents = new Subject<T>();
    private __busyManager: BusyStateScopeManager;
    private __busyClearedEarly = false;

    private __logService: LogService;
    private __telemetryService: TelemetryService;

    constructor(
        componentName: string,
        injector: Injector,
        busyComponentName?: BusyStateName) {

        super(componentName, injector.get(BroadcastService));

        this.ngUnsubscribe = new Subject();

        this.__telemetryService = injector.get(TelemetryService);
        this.__logService = injector.get(LogService);
        if (busyComponentName) {
            this.__busyManager = new BusyStateScopeManager(this._broadcastService, busyComponentName);
        }

        const preCheckEvents = this.__inputEvents
            .takeUntil(this.ngUnsubscribe)
            .do(input => {

                if (this.isParentComponent) {
                    this.__telemetryService.featureConstructComplete(this.featureName);
                }

                if (this.__busyManager) {
                    this.setBusy();

                    this.__telemetryService.featureLoading(
                        this.isParentComponent,
                        this.featureName,
                        this.componentName);

                    this.__logService.verbose(
                        LogCategories.featureComponent,
                        `New input received, setting busy componentName: ${this.componentName}`);
                }
            });

        this.setup(preCheckEvents)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(r => {
                if (!this.__busyClearedEarly && this.__busyManager) {
                    this.__logService.verbose(
                        LogCategories.featureComponent,
                        `Clearing busy normally componentName: ${this.componentName}`);

                    this.__telemetryService.featureLoadingComplete(this.featureName, this.componentName);
                    this.clearBusy();
                }
            }, err => {
                this.__logService.error(
                    LogCategories.featureComponent,
                    '/load-failure',
                    `Component ${this.componentName} threw an unhandled error: ${err}`);
                this.clearBusy();
            });
    }

    protected setInput(input: T) {
        this.__inputEvents.next(input);
    }

    protected setBusy() {
        if (!this.__busyManager) {
            throw Error(`No busy manager defined, component: ${this.componentName}`);
        }

        if (!this.featureName) {
            throw Error(`featureName must be defined for the featureComponent ${this.componentName}`);
        }

        this.__logService.debug(
            LogCategories.featureComponent,
            `Setting busy componentName: ${this.componentName}`);

        this.__busyManager.setBusy();
    }

    // Use this to clear the busy state before the initial setup observable has
    // completed loading.  This is useful if the main parts of your UI are ready
    // to be used, but you still want to load some stuff in the background.
    protected clearBusyEarly() {
        this.__busyClearedEarly = true;
        this.__telemetryService.featureLoadingComplete(this.featureName, this.componentName);
        this.__logService.verbose(
            LogCategories.featureComponent,
            `Clearing busy early componentName: ${this.componentName}`);

        this.clearBusy();
    }

    protected clearBusy() {
        if (!this.__busyManager) {
            throw Error(`No busy manager defined, component: ${this.componentName}`);
        }

        if (!this.featureName) {
            throw Error(`featureName must be defined for the featureComponent ${this.componentName}`);
        }

        this.__logService.debug(
            LogCategories.featureComponent,
            `Clearing busy componentName: ${this.componentName}`);

        this.__busyManager.clearBusy();
    }

    protected abstract setup(inputEvents: Observable<T>): Observable<any>;

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        if (this.__busyManager) {
            this.__logService.debug(LogCategories.featureComponent, `In destroy.  Clearing busy for componentName: ${this.componentName}`);
            this.__busyManager.clearBusy();
        }
    }
}
