import {Component, OnInit, EventEmitter, OnDestroy} from 'angular2/core';
import {FunctionsService} from '.././services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';
import {Observable, Subscription} from 'rxjs/Rx';
import {Subject} from 'rxjs/Subject';
import {PortalService} from '../services/portal.service';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {SideBarFilterPipe} from '../pipes/sidebar.pipe';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.component.html',
    styleUrls: [ 'styles/sidebar.style.css' ],
    inputs: ['functionsInfo'],
    pipes: [SideBarFilterPipe]
})
export class SideBarComponent implements OnDestroy {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public inIFrame: boolean;
    private subscriptions: Subscription[];

    constructor(private _functionsService: FunctionsService,
                private _portalService: PortalService,
                private _broadcastService: IBroadcastService) {

        this.subscriptions = [];
        this.inIFrame = this._portalService.inIFrame;

        this.subscriptions.push(this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction === fi) delete this.selectedFunction;
            for (var i = 0; this.functionsInfo.length; i++) {
                if (this.functionsInfo[i] === fi) {
                    this.functionsInfo.splice(i, 1);
                    break;
                }
            }
        }));

        this.subscriptions.push(this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionAdded, fi => {
            this.functionsInfo.push(fi);
            this.functionsInfo.sort();
            this.selectFunction(fi);
        }));
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    selectFunction(fi: FunctionInfo) {
        this.selectedFunction = fi;
        this._broadcastService.broadcast(BroadcastEvent.FunctionSelected, fi);
    }
}