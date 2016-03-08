import {Component} from 'angular2/core';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

@Component({
    selector: 'busy-state',
    templateUrl: 'templates/busy-state.component.html',
    styleUrls: ['styles/busy-state.style.css']
})
export class BusyStateComponent {
    public busy: boolean = false;
    constructor(private _broadcastService: IBroadcastService) {
        this._broadcastService.subscribe<boolean>(BroadcastEvent.BusyState, state => this.busy = state);
    }
}