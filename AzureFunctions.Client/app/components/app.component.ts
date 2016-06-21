import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
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
import {MonitoringService} from '../services/app-monitoring.service';
import {BackgroundTasksService} from '../services/background-tasks.service';
import {GlobalStateService} from '../services/global-state.service';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {TryLandingComponent} from './try-landing.component';

@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.component.html',
    directives: [BusyStateComponent, DashboardComponent, GettingStartedComponent, ErrorListComponent, TryLandingComponent]
})
export class AppComponent implements OnInit, AfterViewInit {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    public gettingStarted: boolean;
    public ready: boolean = false;
    public showTryView:boolean;
    public functionContainer: FunctionContainer;
    public currentResourceId: string;
    private _readyFunction: boolean = false;
    private _readyResources: boolean = false;

    get readyFunction(): boolean {
        return this._readyFunction;
    }

    set readyFunction(value:boolean) {
        this._readyFunction = value;
        this.ready = this._readyFunction && this._readyResources;
    }

    get readyResources(): boolean {
        return this._readyResources;
    }

    set readyResources(value: boolean) {
        this._readyResources = value;
        this.ready = this._readyFunction && this._readyResources;
    }

    constructor(
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _armService: ArmService,
        private _userService: UserService,
        private _monitoringService: MonitoringService,
        private _backgroundTasksService: BackgroundTasksService,
        private _globalStateService: GlobalStateService,
        private _trnaslateService: TranslateService
    ) {
        this.gettingStarted = !_userService.inIFrame;
        this.showTryView = this._globalStateService.showTryView; 
        this._functionsService.getResources().subscribe(() => {
            this.readyResources = true;
        });
    }

    ngOnInit() {
        this._globalStateService.setBusyState();
        if (!this.gettingStarted && !this.showTryView ) {
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
            this.readyFunction = true;
            this._globalStateService.clearBusyState();
        }
    }

    ngAfterViewInit() {
        this._globalStateService.GlobalBusyStateComponent  = this.busyState;
    }


    initializeDashboard(functionContainer: FunctionContainer | string) {
        this._globalStateService.setBusyState();
        if (typeof functionContainer !== 'string')
            //TODO: investigate this
            this.showTryView = functionContainer.tryScmCred === null;

        if (this.showTryView && this.redirectToIbizaIfNeeded(functionContainer)) return;

        if (typeof functionContainer !== 'string') {
            this._broadcastService.clearAllDirtyStates();
            if (functionContainer.properties &&
                functionContainer.properties.hostNameSslStates) {
                this._userService.setFunctionContainer(functionContainer);
                this._functionsService.setScmParams(functionContainer);
                this.gettingStarted = false;
                this._globalStateService.clearBusyState();
                this.readyFunction = true;
                this.functionContainer = functionContainer;
                this._backgroundTasksService.runTasks();
            } else {
                this._globalStateService.setBusyState();
                this._armService.getFunctionContainer(functionContainer.id).subscribe(fc => this.initializeDashboard(fc));
            }
        } else {
            this._globalStateService.setBusyState();
            this._armService.getFunctionContainer(functionContainer).subscribe(fc => this.initializeDashboard(fc));
        }
    }

    private redirectToIbizaIfNeeded(functionContainer: FunctionContainer | string): boolean {
        if (!this._userService.inIFrame &&
            window.location.hostname !== "localhost" &&
            window.location.search.indexOf("ibiza=disabled") === -1 && !this.showTryView) {
            var armId = typeof functionContainer === 'string' ? functionContainer : functionContainer.id;
            this._globalStateService.setBusyState();
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

    private updateReady() {
        this.ready = this._readyResources && this._readyFunction;
    }
}