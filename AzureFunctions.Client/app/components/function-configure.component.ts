import {Component, EventEmitter} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

@Component({
    selector: 'function-configure',
    templateUrl: 'templates/function-configure.component.html',
    styleUrls: ['styles/function-configure.style.css'],
    inputs: ['selectedFunction']
})
export class FunctionConfigureComponent {
    public selectedFunction: FunctionInfo;
    constructor(private _functionsService: FunctionsService,
                private _broadcastService: IBroadcastService) { }

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