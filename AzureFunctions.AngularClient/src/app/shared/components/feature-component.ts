import { TelemetryService } from './../services/telemetry.service';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Injector } from '@angular/core/src/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { ErrorableComponent } from './errorable-component';
import { Input } from '@angular/core';

export abstract class FeatureComponent<T> extends ErrorableComponent implements OnDestroy {
    @Input() featureName: string;

    private _inputEvents = new Subject<T>();
    private _ngUnsubscribe = new Subject();
    private _telemetryService: TelemetryService;

    constructor(componentName: string, injector: Injector) {
        super(componentName, injector.get(BroadcastService));

        this._telemetryService = injector.get(TelemetryService);
        const preCheckEvents = this._inputEvents
            .takeUntil(this._ngUnsubscribe)
            .do(input => {
                if (!this.featureName) {
                    throw Error('featureName is not defined');
                }

                this._telemetryService.featureLoading(this.featureName, this.componentName);
            });

        this.setup(preCheckEvents)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(r => {
                this._telemetryService.featureLoadingComplete(this.featureName, this.componentName);
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
