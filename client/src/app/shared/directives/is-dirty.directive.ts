import { PortalService } from './../services/portal.service';
import { Directive, Input, SimpleChange, OnChanges, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';


@Directive({
    selector: '[is-dirty]',
})
export class IsDirtyDirective implements OnChanges, OnDestroy {

    @Input('is-dirty') dirty: boolean;

    // If dirtyMessage is null, we'll just use the default Ibiza message
    @Input('is-dirty-message') dirtyMessage: string;

    private _dirtyStream = new Subject<boolean>();
    private _ngUnsubscribe = new Subject();

    constructor(private _portalService: PortalService) {

        this._dirtyStream
            .takeUntil(this._ngUnsubscribe)
            .debounceTime(100)          // Give some time for message changes
            .subscribe(dirty => {

                this._portalService.updateDirtyState(
                    dirty,
                    this.dirtyMessage);

            });
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (this.dirty !== undefined) {
            this._dirtyStream.next(this.dirty);
        }
    }

    ngOnDestroy() {
        this._portalService.updateDirtyState(
            false,
            this.dirtyMessage);

        this._ngUnsubscribe.next();
    }
}
