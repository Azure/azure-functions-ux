import {Component, EventEmitter} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';


@Component({
    selector: 'function-configure',
    templateUrl: 'templates/function-configure.component.html',
    styleUrls: ['styles/function-configure.style.css'],
    inputs: ['selectedFunction'],
    outputs: ['deleteSelectedFunction'],
})
export class FunctionConfigureComponent {
    public selectedFunction: FunctionInfo;
    public deleteSelectedFunction: EventEmitter<boolean>;
    constructor(private _functionsService: FunctionsService) {
        this.deleteSelectedFunction = new EventEmitter<boolean>();
    }

    deleteFunction() {
        var result = confirm(`Are you sure you want to delete Function: ${this.selectedFunction.name}?`);
        if (result)
            this._functionsService.deleteFunction(this.selectedFunction)
                .subscribe(r => {
                    this.deleteSelectedFunction.emit(false);
                    this.deleteSelectedFunction.emit(true);
                });
    }
}