import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '.././services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Subject';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.html',
    inputs: ['functionsInfo', 'deleteSelectedFunction'],
    outputs: ['functionSelected: selectedFunction']
})
export class SideBarComponent {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    private functionSelected: EventEmitter<FunctionInfo>;

    constructor(private _functionsService: FunctionsService) {
        this.functionSelected = new EventEmitter<FunctionInfo>();
    }

    set deleteSelectedFunction(f: boolean) {
        if (f)
        for (var i = 0; this.functionsInfo.length; i++) {
            if (this.functionsInfo[i] === this.selectedFunction) {
                this.functionsInfo.splice(i, 1);
                delete this.selectedFunction;
                break;
            }
        }
    }
}