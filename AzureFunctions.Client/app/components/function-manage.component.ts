import {Component} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {SelectOption} from '../models/select-option';
import {RadioSelectorComponent} from './radio-selector.component';
import {PortalService} from '../services/portal.service';

@Component({
    selector: 'function-manage',
    templateUrl: 'templates/function-manage.component.html',
    styleUrls: ['styles/function-manage.style.css'],
    inputs: ['selectedFunction'],
    directives: [RadioSelectorComponent]
})
export class FunctionManageComponent {
    public selectedFunction: FunctionInfo;
    public functionStatusOptions: SelectOption<boolean>[];
    public disabled: boolean;
    private valueChange: Subject<boolean>;

    constructor(private _functionsService: FunctionsService,
                private _broadcastService: BroadcastService,
                private _portalService: PortalService) {
        this.disabled = _broadcastService.getDirtyState("function_disabled");
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
            .debounceTime(500)
            .switchMap<FunctionInfo>((state, index) => {
                this.selectedFunction.config.disabled = state;
                return this._functionsService.updateFunction(this.selectedFunction);
            })
            .subscribe(fi => this.selectedFunction.config.disabled = fi.config.disabled);
    }

    deleteFunction() {
        var result = confirm(`Are you sure you want to delete Function: ${this.selectedFunction.name}?`);
        if (result) {
            this._broadcastService.setBusyState();
            this._portalService.logAction("edit-component", "delete");
            this._functionsService.deleteFunction(this.selectedFunction)
                .subscribe(r => {
                    this._broadcastService.broadcast(BroadcastEvent.FunctionDeleted, this.selectedFunction);
                    this._broadcastService.clearBusyState();
                });
        }
    }
}