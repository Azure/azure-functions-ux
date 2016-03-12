import {Component, OnInit} from 'angular2/core';
import {DashboardComponent} from './dashboard.component';
import {GettingStartedComponent} from './getting-started.component';
import {PortalService} from '../services/portal.service';
import {FunctionsService} from '../services/functions.service';
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';
import {BusyStateComponent} from './busy-state.component';
import {ArmService} from '../services/arm.service';
import {FunctionContainer} from '../models/function-container';

@Component({
    selector: 'azure-functions-app',
    template: `<busy-state></busy-state>
<functions-dashboard *ngIf="!gettingStarted" [functionContainer]="functionContainer"></functions-dashboard>
<getting-started *ngIf="gettingStarted && ready" (userReady)="onUserReady($event)"></getting-started>`,
    directives: [BusyStateComponent, DashboardComponent, GettingStartedComponent]
})
export class AppComponent implements OnInit {
    public gettingStarted: boolean;
    public functionContainer: FunctionContainer;
    public ready: boolean;

    constructor(
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService,
        private _armService: ArmService
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
        this._armService.Initialize()
            .subscribe(() => {
                this.ready = true;
                this._broadcastService.clearBusyState();
            });
    }

    onUserReady(functionContainer: FunctionContainer) {
        this.gettingStarted = !functionContainer;
        this.functionContainer = functionContainer;
    }
}