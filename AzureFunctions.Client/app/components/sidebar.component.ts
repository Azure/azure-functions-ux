import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '.././services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Subject';
import {PortalService} from '../services/portal.service';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.component.html',
    styleUrls: [ 'styles/sidebar.style.css' ],
    inputs: ['functionsInfo', 'addedFunction'],
    outputs: ['functionSelected: selectedFunction']
})
export class SideBarComponent {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public inIFrame: boolean;
    private functionSelected: EventEmitter<FunctionInfo>;

    constructor(private _functionsService: FunctionsService,
                private _portalService: PortalService,
                private _broadcastService: IBroadcastService) {

        this.functionSelected = new EventEmitter<FunctionInfo>();
        this.inIFrame = this._portalService.inIFrame;
        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction === fi) delete this.selectedFunction;
            for (var i = 0; this.functionsInfo.length; i++) {
                if (this.functionsInfo[i] === fi) {
                    this.functionsInfo.splice(i, 1);
                    break;
                }
            }
        })
    }

    set addedFunction(value: FunctionInfo) {
        if (value) {
            this.functionsInfo.push(value);
            this.selectedFunction = value;
            this.functionSelected.emit(value);
        }
    }
}