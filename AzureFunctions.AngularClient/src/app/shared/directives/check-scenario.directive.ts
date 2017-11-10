import { ScenarioService } from './../services/scenario/scenario.service';
import { ScenarioCheckInput } from './../services/scenario/scenario.models';
import { Directive, Input, ElementRef, SimpleChange, OnChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';


@Directive({
    selector: '[check-scenario]',
})
export class CheckScenarioDirective implements OnChanges {


    @Input('check-scenario') id: string;
    @Input('cs-input') input: ScenarioCheckInput;
    @Input('cs-enabledByDefault') enabledByDefault = false;
    @Input('cs-enabledClass') enabledClass = '';
    @Input('cs-disabledClass') disabledClass = 'hidden';

    private _idStream = new Subject<string>();

    constructor(
        scenarioCheckService: ScenarioService,
        private _elementRef: ElementRef) {

        this._idStream
            .debounceTime(100)
            .switchMap(id => {
                return scenarioCheckService.checkScenarioAsync(this.id, this.input);
            })
            .subscribe(result => {
                this._updateClass(result.status);
            });
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (this.enabledByDefault) {
            this._updateClass('enabled');
        } else {
            this._updateClass('disabled');
        }

        if (this.id && this.input) {
            this._idStream.next(this.id);
        }
    }

    private _updateClass(status: 'enabled' | 'disabled') {
        const nativeElement = <HTMLElement>this._elementRef.nativeElement;
        if (status === 'disabled') {

            if (this.enabledClass) {
                nativeElement.classList.remove(this.enabledClass);
            }

            if (this.disabledClass) {
                nativeElement.classList.add(this.disabledClass);
            }

        } else if (status === 'enabled') {

            if (this.disabledClass) {
                nativeElement.classList.remove(this.disabledClass);
            }

            if (this.enabledClass) {
                nativeElement.classList.add(this.enabledClass);
            }
        }
    }
}
