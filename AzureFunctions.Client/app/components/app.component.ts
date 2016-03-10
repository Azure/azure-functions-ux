import {Component, OnInit} from 'angular2/core';
import {DashboardComponent} from './dashboard.component';
import {GettingStartedComponent} from './getting-started.component';
import {PortalService} from '../services/portal.service';
import {FunctionsService} from '../services/functions.service';
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';

@Component({
    selector: 'azure-functions-app',
    template: `<busy-state></busy-state>
<functions-dashboard *ngIf="!gettingStarted"></functions-dashboard>
<getting-started [loggedIn]="loggedIn" (userReady)="onUserReady($event)" *ngIf="gettingStarted"></getting-started>`,
    directives: [DashboardComponent, GettingStartedComponent]
})
export class AppComponent implements OnInit {
    public gettingStarted: boolean;
    public loggedIn: boolean;

    constructor(
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService
    ) {
        if (_portalService.inIFrame ||
            window.location.protocol === 'http:') {
            this.gettingStarted = false;
            return;
        }

        this.loggedIn = document.cookie.indexOf('authenticated=true') !== -1;
        this.gettingStarted = !this.loggedIn || false;
    }

    ngOnInit() {
        if (!this.gettingStarted) return;

        this._broadcastService.setBusyState();

        this._functionsService.initializeUser()
            .subscribe(
                res => this.gettingStarted = !!res,
                e => console.log(e),
                () => this._broadcastService.clearBusyState()
            );
    }

    onUserReady(userReady: boolean) {
        this.gettingStarted = !userReady;
    }
}