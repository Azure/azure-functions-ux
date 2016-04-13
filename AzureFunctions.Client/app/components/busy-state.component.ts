import {Component} from 'angular2/core';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'

@Component({
    selector: 'busy-state',
    templateUrl: 'templates/busy-state.component.html',
    styleUrls: ['styles/busy-state.style.css']
})
export class BusyStateComponent {
    public busy: boolean = false;
    constructor(private _broadcastService: BroadcastService) {
        this._broadcastService.subscribe<boolean>(BroadcastEvent.BusyState, state => this.busy = state);
    }
}