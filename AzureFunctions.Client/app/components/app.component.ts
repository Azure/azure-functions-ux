import {Component, OnInit} from 'angular2/core';
import {DashboardComponent} from './dashboard.component';
import {GettingStartedComponent} from './getting-started.component';
import {PortalService} from '../services/portal.service';
import {FunctionsService} from '../services/functions.service';
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';
import {BusyStateComponent} from './busy-state.component';

@Component({
    selector: 'azure-functions-app',
    template: `<busy-state></busy-state>
<functions-dashboard *ngIf="!gettingStarted"></functions-dashboard>
<getting-started *ngIf="gettingStarted && ready" (userReady)="onUserReady($event)"></getting-started>`,
    directives: [BusyStateComponent, DashboardComponent, GettingStartedComponent]
})
export class AppComponent implements OnInit {
    public gettingStarted: boolean;
    public ready: boolean;

    constructor(
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService
    ) {
        this.ready = false;
        if (_portalService.inIFrame ||
            window.location.protocol === 'http:') {
            this.gettingStarted = false;
            return;
        } else {
            this.gettingStarted = true;
        }
    }

    ngOnInit() {
        if (!this.gettingStarted) return;

        this._broadcastService.setBusyState();

        this._functionsService.initializeUser()
            .subscribe(
                res => {
                    this.gettingStarted = !res;
                    this._broadcastService.clearBusyState();
                    this.ready = true;
                },
                e => {
                    if (e.status === 404) {
                        this.gettingStarted = true;
                        this._broadcastService.clearBusyState();
                        this.ready = true;
                    } else {
                        console.log(e);
                    }
                });
    }

    onUserReady(userReady: boolean) {
        this.gettingStarted = !userReady;
    }
}