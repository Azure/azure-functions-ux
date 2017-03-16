import { ErrorIds } from './shared/models/error-ids';
import { Constants } from './shared/models/constants';
import { AiService } from './shared/services/ai.service';
import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {PortalService} from './shared/services/portal.service';
import {FunctionsService} from './shared/services/functions.service';
import {BroadcastService} from './shared/services/broadcast.service';
import {BroadcastEvent} from './shared/models/broadcast-event';
import {BusyStateComponent} from './busy-state/busy-state.component';
import {ArmService} from './shared/services/arm.service';
import {FunctionContainer} from './shared/models/function-container';
import {UserService} from './shared/services/user.service';
import {Observable} from 'rxjs/Rx';
import {MonitoringService} from './shared/services/app-monitoring.service';
import {BackgroundTasksService} from './shared/services/background-tasks.service';
import {GlobalStateService} from './shared/services/global-state.service';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {PortalResources} from './shared/models/portal-resources';
import { ConfigService } from './shared/services/config.service';
import { ErrorEvent, ErrorType } from "./shared/models/error-event";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;

    public gettingStarted: boolean;
    public ready: boolean = false;
    public showTryLandingPage: boolean;
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
        private _configService: ConfigService,
        private _portalService: PortalService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _armService: ArmService,
        private _userService: UserService,
        private _monitoringService: MonitoringService,
        private _backgroundTasksService: BackgroundTasksService,
        private _globalStateService: GlobalStateService,
        private _trnaslateService: TranslateService,
        private _aiService: AiService
    ) {
        this.gettingStarted = !_userService.inIFrame;
        this.showTryLandingPage = this._globalStateService.showTryView;
        this._functionsService.getResources().subscribe(() => {
            this.readyResources = true;
        });
        this._globalStateService._functionsService = this._functionsService;
    }

    ngOnInit() {
        this._globalStateService.setBusyState();
        if (!this.gettingStarted && !this.showTryLandingPage) {
            this._portalService.getResourceId()
                .distinctUntilChanged()
                .debounceTime(500)
                .subscribe((resourceId: string) => {
                    // Not sure why distinctUntilChanged() isn't taking care of this.
                    if (!this.currentResourceId || this.currentResourceId.toLocaleLowerCase() !== resourceId.toLocaleLowerCase()) {
                        this.currentResourceId = resourceId;
                        this.initializeDashboard(resourceId);
                        this.logFunctionsRuntimeVersion(resourceId);
                    }
                });
        } else {
            this.readyFunction = true;
            this._globalStateService.clearBusyState();
        }
    }

    ngAfterViewInit() {
        this._globalStateService.GlobalBusyStateComponent = this.busyState;
    }


    initializeDashboard(functionContainer: FunctionContainer | string, appSettingsAccess?: boolean, authSettings?: { [key: string]: any }) {
        this._globalStateService.setBusyState();

        if (this.redirectToIbizaIfNeeded(functionContainer)) {
            return;
        }

        if (typeof functionContainer !== 'string') {
            this._broadcastService.clearAllDirtyStates();
            if (functionContainer.properties &&
                functionContainer.properties.hostNameSslStates &&
                (authSettings || this._globalStateService.showTryView)) {
                // Make sure at least 5 seconds have elapsed since last time the app has been modified.
                // This delay is to avoid a race condition with negative DNS caching for app host name.
                // See https://github.com/projectkudu/AzureFunctionsPortal/issues/951
                // let deltaSinceLastModified = this.getDeltaSinceLastModifiedInSeconds(functionContainer);
                // if (deltaSinceLastModified > 0) {
                //     setTimeout(() => {
                //         this.initializeDashboard(functionContainer, appSettingsAccess, authSettings);
                //     }, deltaSinceLastModified * 1000);
                //     return;
                // }
                this.functionContainer = functionContainer;
                if (!functionContainer.tryScmCred && (!appSettingsAccess || !functionContainer.properties.enabled || functionContainer.properties.state === 'Stopped')) {
                    this._globalStateService.GlobalDisabled = true;
                    if (!appSettingsAccess) {
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: this._trnaslateService.instant(PortalResources.error_NoPermissionToAccessApp),
                            errorId: ErrorIds.userDoesntHaveAccess,
                            errorType: ErrorType.Fatal
                        });
                    } else {
                        let error = functionContainer.properties.siteDisabledReason === 1
                            ? PortalResources.error_FunctionExceededQuota
                            : PortalResources.error_siteStopped;
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: this._trnaslateService.instant(error),
                            errorId: ErrorIds.functionAppStopped,
                            errorType: ErrorType.Fatal
                        });
                    }
                }
                if (authSettings) {
                    // This is for try scenario.
                    this._functionsService.setEasyAuth(authSettings);
                }
                this._userService.setFunctionContainer(functionContainer);
                this._functionsService.setScmParams(functionContainer);
                this.gettingStarted = false;
                this.showTryLandingPage = false;
                this._globalStateService.clearBusyState();
                this.readyFunction = true;
                this._backgroundTasksService.runTasks();
                this._userService.getToken()
                    .delay(2000)
                    .subscribe(() => {
                        this._functionsService.diagnose(functionContainer)
                            .subscribe(diagnosticsResults => {
                                if (diagnosticsResults) {
                                    for (let i = 0; i < diagnosticsResults.length; i++) {
                                        if (diagnosticsResults[i].isDiagnosingSuccessful) {
                                            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                                                message: `${diagnosticsResults[i].successResult.message} ${diagnosticsResults[i].successResult.userAction}`,
                                                errorId: diagnosticsResults[i].successResult.actionId,
                                                errorType: diagnosticsResults[i].successResult.isTerminating ? ErrorType.Fatal : ErrorType.UserError
                                            });
                                        }
                                    }
                                }
                            });
                    });
            } else {
                this._globalStateService.setBusyState();
                this._userService.getToken().first().subscribe(() =>
                    Observable.zip(
                        this._armService.getFunctionContainer(functionContainer.id),
                        this._armService.getCanAccessAppSettings(functionContainer.id),
                         this._armService.getAuthSettings(functionContainer.id),
                        (fc, access, auth) => ({ functionContainer: fc, access: access, auth: auth}))
                        .subscribe(result => this.initializeDashboard(result.functionContainer, result.access, result.auth)));
            }
        } else {
            this._globalStateService.setBusyState();
            this._userService.getToken().first().subscribe(() =>
                Observable.zip(
                    this._armService.getFunctionContainer(functionContainer),
                    this._armService.getCanAccessAppSettings(functionContainer),
                    this._armService.getAuthSettings(functionContainer),
                    (fc, access, auth) => ({ functionContainer: fc, access: access, auth: auth }))
                    .subscribe(result => this.initializeDashboard(result.functionContainer, result.access, result.auth)));
        }
    }

    /**
     * Make sure at least 5 seconds have elapsed since last time the app has been modified.
     * This delay is to avoid a race condition with negative DNS caching for app host name.
     * See https://github.com/projectkudu/AzureFunctionsPortal/issues/95
     * Max = 5 Seconds, Min = 0 Seconds
     * @param functionContainer an ARM object for the function app.
     */
    private getDeltaSinceLastModifiedInSeconds(functionContainer: FunctionContainer): number {
        if (functionContainer.properties.lastModifiedTimeUtc) {
            let lastModifiedTime = new Date(functionContainer.properties.lastModifiedTimeUtc);
            let timeDiff = (new Date().getTime() - lastModifiedTime.getTime()) / 1000;
            let deltaTime = 5 - timeDiff;
            this._aiService.trackEvent('/portal/LoadingPortal', {
                lastModifiedTime: lastModifiedTime.toISOString(),
                timeDiff: timeDiff.toString(),
                delta: deltaTime.toString(),
                appName: functionContainer.id
            });
            if (deltaTime < 0) {
                return 0;
            } else if (deltaTime > 5) {
                return 5;
            } else {
                return deltaTime;
            }
        } else {
            return 0;
        }
    }

    private logFunctionsRuntimeVersion(resourceId: string) {
        this._armService.getFunctionContainerAppSettings(resourceId)
            .subscribe(settings => {
                if (settings) {
                    this._aiService.trackEvent('/values/runtime_version', { runtime: settings[Constants.runtimeVersionAppSettingName], appName: resourceId });
                }
            });
    }

    private redirectToIbizaIfNeeded(functionContainer: FunctionContainer | string): boolean {
        if (!this._userService.inIFrame &&
            this._configService.isAzure() &&
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