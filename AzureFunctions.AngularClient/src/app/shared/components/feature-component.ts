import { LogService } from './../services/log.service';
import { TelemetryService } from './../services/telemetry.service';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Injector } from '@angular/core/src/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { ErrorableComponent } from './errorable-component';
import { Input } from '@angular/core';
import { LogCategories } from 'app/shared/models/constants';

export abstract class FeatureComponent<T> extends ErrorableComponent implements OnDestroy {
    @Input() featureName: string;
    isParentComponent = false;

    private _inputEvents = new Subject<T>();
    private _ngUnsubscribe = new Subject();
    private _telemetryService: TelemetryService;

    constructor(componentName: string, injector: Injector) {
        super(componentName, injector.get(BroadcastService));

        this._telemetryService = injector.get(TelemetryService);
        const logService = injector.get(LogService);

        const preCheckEvents = this._inputEvents
            .takeUntil(this._ngUnsubscribe)
            .do(input => {
                if (!this.featureName) {
                    throw Error('featureName is not defined');
                }

                this._telemetryService.featureLoading(this.isParentComponent, this.featureName, this.componentName);
            });

        this.setup(preCheckEvents)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(r => {
                this._telemetryService.featureLoadingComplete(this.featureName, this.componentName);
            }, err => {
                logService.error(LogCategories.featureLoading, '/load-failure', err);
            });
    }

    protected setInput(input: T) {
        this._inputEvents.next(input);
    }

    protected abstract setup(inputEvents: Observable<T>): Observable<any>;

    ngOnDestroy(): void {
        this._ngUnsubscribe.next();
    }
}
