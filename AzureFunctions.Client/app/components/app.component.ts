import {Component, OnInit} from '@angular/core';
import {DashboardComponent} from './dashboard.component';
import {GettingStartedComponent} from './getting-started.component';
import {PortalService} from '../services/portal.service';
import {FunctionsService} from '../services/functions.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {BusyStateComponent} from './busy-state.component';
import {ArmService} from '../services/arm.service';
import {FunctionContainer} from '../models/function-container';
import {UserService} from '../services/user.service';
import {Observable} from 'rxjs/Rx';
import {ErrorListComponent} from './error-list.component';
import {MonitoringService} from '../services/appMonitoring.service';
import {BackgroundTasksService} from '../services/background-tasks.service';

@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.component.html',
    directives: [BusyStateComponent, DashboardComponent, GettingStartedComponent, ErrorListComponent]
})
export class AppComponent implements OnInit {
    public gettingStarted: boolean;
    public ready: boolean;
    public functionContainer: FunctionContainer;
    public currentResourceId: string;

    constructor(
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _armService: ArmService,
        private _userService: UserService,
        private _monitoringService: MonitoringService,
        private _backgroundTasksService: BackgroundTasksService
    ) {
        this.ready = false;
        this.gettingStarted = !_userService.inIFrame;
    }

    ngOnInit() {
        this._broadcastService.setBusyState();

        if (!this.gettingStarted) {
            this._portalService.getResourceId()
                .distinctUntilChanged()
                .debounceTime(500)
                .subscribe((resourceId: string) => {
                    // Not sure why distinctUntilChanged() isn't taking care of this.
                    if (!this.currentResourceId || this.currentResourceId.toLocaleLowerCase() !== resourceId.toLocaleLowerCase()) {
                        this.currentResourceId = resourceId;
                        this.initializeDashboard(resourceId);
                    }
                });
        } else {
            this.ready = true;
            this._broadcastService.clearBusyState();
        }
    }

    initializeDashboard(functionContainer: FunctionContainer | string) {
        if (this.redirectToIbizaIfNeeded(functionContainer)) return;
        if (typeof functionContainer !== 'string') {
            this._broadcastService.clearAllDirtyStates();
            if (functionContainer.properties &&
                functionContainer.properties.hostNameSslStates) {
                this._userService.setFunctionContainer(functionContainer);
                // this._functionsService.setFunctionContainer(functionContainer).subscribe(() => {
                //     this._broadcastService.broadcast(BroadcastEvent.VesrionUpdated);
                // });
                this.gettingStarted = false;
                this._broadcastService.clearBusyState();
                this.ready = true;
                this.functionContainer = functionContainer;
            } else {
                this._broadcastService.setBusyState();
                this._armService.getFunctionContainer(functionContainer.id).subscribe(fc => this.initializeDashboard(fc));
            }
        } else {
            this._broadcastService.setBusyState();
            this._armService.getFunctionContainer(functionContainer).subscribe(fc => this.initializeDashboard(fc));
        }

    }

    private redirectToIbizaIfNeeded(functionContainer: FunctionContainer | string): boolean {
        if (!this._userService.inIFrame &&
            window.location.hostname !== "localhost" &&
            window.location.search.indexOf("ibiza=disabled") === -1) {
            var armId = typeof functionContainer === 'string' ? functionContainer : functionContainer.id;
            this._broadcastService.setBusyState();
            this._userService.getTenants()
                .retry(10)
                .subscribe(tenants => {
                    var currentTenant = tenants.find(t => t.Current);
                    var portalHostName = 'https://portal.azure.com';
                    var environment = '';
                    if (window.location.host.indexOf('staging') !== -1) {
                        environment = '?websitesextension_functionsstaged=true';
                    } else if (window.location.host.indexOf('next') !== -1) {
                        environment = '?websitesextension_functionsnext=true';
                    }
                    window.location.replace(`${portalHostName}/${currentTenant.DomainName}${environment}#resource${armId}`);
                });
            return true;
        } else {
            return false;
        }
    }
}