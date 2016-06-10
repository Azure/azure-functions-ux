import { Component } from "angular2/core";
import { TimerComponent } from "ng2-timer/src/ng2-timer";
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {TimerEvent}  from '../models/timer-event';

@Component({
    selector: "timer-app",
    template: `
        <h1>Angular 2 Timer Example</h1>
        <ng-timer [format]="'mm:ss:SSS'"></ng-timer>
    `,
    directives: [TimerComponent]
})
export class TimerAppComponent
{
    constructor(private _broadcastService: BroadcastService) {
        _broadcastService.subscribe<TimerEvent>(BroadcastEvent.TimerStarted, (e) => {

        });
    }
    }

