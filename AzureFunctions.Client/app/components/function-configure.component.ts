import {Component} from 'angular2/core';
import {Subject} from 'rxjs/Rx';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {SelectOption} from '../models/select-option';
import {RadioSelectorComponent} from './radio-selector.component';

@Component({
    selector: 'function-configure',
    templateUrl: 'templates/function-configure.component.html',
    styleUrls: ['styles/function-configure.style.css'],
    inputs: ['selectedFunction'],
    directives: [RadioSelectorComponent]
})
export class FunctionConfigureComponent {
    public selectedFunction: FunctionInfo;
    public functionStatusOptions: SelectOption<boolean>[];
    private valueChange: Subject<boolean>;

    constructor(private _functionsService: FunctionsService,
                private _broadcastService: BroadcastService) {
        this.functionStatusOptions = [
            {
                displayLabel: 'Enabled',
                value: false
            }, {
                displayLabel: 'Disabled',
                value: true
            }];
        this.valueChange = new Subject<boolean>();
        this.valueChange
            .distinctUntilChanged()
            .debounceTime<boolean>(500)
            .switchMap<FunctionInfo>(state => {
                this.selectedFunction.config.disabled = state;
                return this._functionsService.updateFunction(this.selectedFunction);
            })
            .subscribe(fi => this.selectedFunction.config.disabled = fi.config.disabled);
    }

    deleteFunction() {
        var result = confirm(`Are you sure you want to delete Function: ${this.selectedFunction.name}?`);
        if (result) {
            this._functionsService.deleteFunction(this.selectedFunction)
                .subscribe(r => {
                    this._broadcastService.broadcast(BroadcastEvent.FunctionDeleted, this.selectedFunction);
                });
        }
    }
}