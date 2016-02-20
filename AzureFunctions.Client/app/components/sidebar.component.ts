import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '.././services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Subject';
import {PortalService} from '../services/portal.service';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.component.html',
    styleUrls: [ 'styles/sidebar.style.css' ],
    inputs: ['functionsInfo', 'deleteSelectedFunction', 'addedFunction'],
    outputs: ['functionSelected: selectedFunction']
})
export class SideBarComponent {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public inIFrame: boolean;
    private functionSelected: EventEmitter<FunctionInfo>;

    constructor(private _functionsService: FunctionsService,
                private _portalService: PortalService) {
        this.functionSelected = new EventEmitter<FunctionInfo>();
        this.inIFrame = this._portalService.inIFrame;
    }

    set addedFunction(value: FunctionInfo) {
        if (value) {
            this.functionsInfo.push(value);
            this.selectedFunction = value;
            this.functionSelected.emit(value);
        }
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