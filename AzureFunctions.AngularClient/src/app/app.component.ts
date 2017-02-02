import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {PortalService} from './shared/services/portal.service';
import {FunctionsService} from './shared/services/functions.service';
import {BroadcastService} from './shared/services/broadcast.service';
import {BroadcastEvent} from './shared/models/broadcast-event'
import {BusyStateComponent} from './busy-state/busy-state.component';  //Com
import {ArmService} from './shared/services/arm.service';
import {FunctionContainer} from './shared/models/function-container';
import {UserService} from './shared/services/user.service';
import {Observable} from 'rxjs/Rx';
import {MonitoringService} from './shared/services/app-monitoring.service';
import {BackgroundTasksService} from './shared/services/background-tasks.service';
import {GlobalStateService} from './shared/services/global-state.service';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {LocalDevelopmentInstructionsComponent} from './local-development-instructions/local-development-instructions.component';  // Com
import {PortalResources} from './shared/models/portal-resources';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    @ViewChild(LocalDevelopmentInstructionsComponent) localDevelopment: LocalDevelopmentInstructionsComponent;
    //@ViewChild(DashboardComponent) dashboardComponent: DashboardComponent;

    public gettingStarted: boolean;
    public ready: boolean = false;
    public showTryView: boolean;
    public functionContainer: FunctionContainer;
    public currentResourceId: string;
    private _readyFunction: boolean = false;
    private _readyResources: boolean = false;

    get readyFunction(): boolean {
        return this._readyFunction;
    }

    set readyFunction(value: boolean) {
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
        this._globalStateService._functionsService = this._functionsService;
    }

    ngOnInit() {
        this._globalStateService.setBusyState();
        if (!this.gettingStarted && !this.showTryView) {
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
        this._globalStateService.GlobalBusyStateComponent = this.busyState;
        this._globalStateService.LocalDevelopmentInstructionsComponent = this.localDevelopment;
    }


    initializeDashboard(functionContainer: FunctionContainer | string, appSettingsAccess?: boolean) {
        this._globalStateService.setBusyState();
        if (typeof functionContainer !== 'string')
            //TODO: investigate this
            this.showTryView = functionContainer.tryScmCred === null;

        if (this.redirectToIbizaIfNeeded(functionContainer)) return;

        if (typeof functionContainer !== 'string') {
            this._broadcastService.clearAllDirtyStates();
            if (functionContainer.properties &&
                functionContainer.properties.hostNameSslStates) {
                this.functionContainer = functionContainer;
                if (!functionContainer.tryScmCred && (!appSettingsAccess || !functionContainer.properties.enabled || functionContainer.properties.state === 'Stopped')) {
                    this._globalStateService.GlobalDisabled = true;
                    if (!appSettingsAccess) {
                        this._broadcastService.broadcast(BroadcastEvent.Error, { message: this._trnaslateService.instant(PortalResources.error_NoPermissionToAccessApp) });
                    } else {
                        let error = functionContainer.properties.siteDisabledReason === 1
                            ? PortalResources.error_FunctionExceededQuota
                            : PortalResources.error_siteStopped;
                        this._broadcastService.broadcast(BroadcastEvent.Error, { message: this._trnaslateService.instant(error) });
                    }
                }
                this._userService.setFunctionContainer(functionContainer);
                this._functionsService.setScmParams(functionContainer);
                this.gettingStarted = false;
                this._globalStateService.clearBusyState();
                this.readyFunction = true;
                this._backgroundTasksService.runTasks();

            } else {
                this._globalStateService.setBusyState();
                this._userService.getToken().first().subscribe(() =>
                    Observable.zip(
                        this._armService.getFunctionContainer(functionContainer.id),
                        this._armService.getCanAccessAppSettings(functionContainer.id),
                        (fc, access) => ({ functionContainer: fc, access: access }))
                        .subscribe(result => this.initializeDashboard(result.functionContainer, result.access)));
            }
        } else {
            this._globalStateService.setBusyState();
            this._userService.getToken().first().subscribe(() =>
                Observable.zip(
                    this._armService.getFunctionContainer(functionContainer),
                    this._armService.getCanAccessAppSettings(functionContainer),
                    (fc, access) => ({ functionContainer: fc, access: access }))
                    .subscribe(result => this.initializeDashboard(result.functionContainer, result.access)));
        }
    }

    private redirectToIbizaIfNeeded(functionContainer: FunctionContainer | string): boolean {
        if (!this._userService.inIFrame &&
            window.location.hostname !== "localhost" &&
            window.location.search.indexOf("ibiza=disabled") === -1
            && (this._globalStateService.ScmCreds === undefined || this._globalStateService.ScmCreds === null)) {
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