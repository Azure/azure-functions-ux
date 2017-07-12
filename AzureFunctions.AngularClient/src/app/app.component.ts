import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';

import { FunctionApp } from './shared/function-app';
import { BusyStateComponent } from './busy-state/busy-state.component';
import { environment } from './../environments/environment.prod';
import { StartupInfo } from './shared/models/portal';
import { BroadcastService } from './shared/services/broadcast.service';
import { FunctionContainer } from './shared/models/function-container';
import { GlobalStateService } from './shared/services/global-state.service';
import { BackgroundTasksService } from './shared/services/background-tasks.service';
import { Constants } from './shared/models/constants';
import { AiService } from './shared/services/ai.service';
import { PortalService } from './shared/services/portal.service';
import { ArmService } from './shared/services/arm.service';
import { UserService } from './shared/services/user.service';
import { FunctionsService } from './shared/services/functions.service';
import { ErrorListComponent } from './error-list/error-list.component';
import { MainComponent } from './main/main.component';
// import {MonitoringService} from './shared/services/app-monitoring.service';
// import {BackgroundTasksService} from './shared/services/background-tasks.service';
// import {GlobalStateService} from './shared/services/global-state.service';
// import {TranslateService} from '@ngx-translate/core';
// import {LocalDevelopmentInstructionsComponent} from './local-development-instructions/local-development-instructions.component';  // Com
// import {PortalResources} from './shared/models/portal-resources';
import { ConfigService } from './shared/services/config.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, AfterViewInit {
    public gettingStarted: boolean;
    public ready: boolean;
    public showTryLanding: boolean;
    public tryFunctionApp: FunctionApp;

    private _startupInfo: StartupInfo;

    @ViewChild(BusyStateComponent) busyStateComponent: BusyStateComponent;

    constructor(
        private _configService: ConfigService,
        private _portalService: PortalService,
        private _armService: ArmService,
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _backgroundTasksService: BackgroundTasksService,
        private _globalStateService: GlobalStateService,
        private _broadcastService: BroadcastService,
    ) {
        this.ready = false;

        this.showTryLanding = window.location.pathname.endsWith('/try');

        if (_userService.inIFrame || window.location.protocol === 'http:' || _userService.inTab) {
            this.gettingStarted = false;
            return;
        } else {
            this.gettingStarted = true;
        }
    }

    ngOnInit() {
        this._userService.getStartupInfo()
            .first()
            .subscribe(info => {
                this._startupInfo = info;
                this.ready = true;

                if (!this._userService.inIFrame) {
                    this.ready = true;

                    if (this._configService.isStandalone()) {
                        this.initializeDashboard(null);
                    }
                }
            });
    }

    ngAfterViewInit() {
        this._globalStateService.GlobalBusyStateComponent = this.busyStateComponent;
    }

    initializeDashboard(functionContainer: FunctionContainer | string, appSettingsAccess?: boolean, authSettings?: { [key: string]: any }) {
        this._globalStateService.setBusyState();

        if (this.redirectToIbizaIfNeeded(functionContainer)) {
            return;
        }

        if (typeof functionContainer !== 'string') {
            this._broadcastService.clearAllDirtyStates();

            if (this._startupInfo) {
                this._startupInfo.resourceId = functionContainer && functionContainer.id;
                this._userService.updateStartupInfo(this._startupInfo);
            }

            this.gettingStarted = false;
            this.showTryLanding = false;
        }
    }

    initializeTryDashboard(functionApp: FunctionApp) {
        this._globalStateService.setBusyState();
        this._broadcastService.clearAllDirtyStates();
        this.gettingStarted = false;
        this.showTryLanding = false;
        this.tryFunctionApp = functionApp;
    }

    private redirectToIbizaIfNeeded(functionContainer: FunctionContainer | string): boolean {
        if (!this._userService.inIFrame &&
            this._configService.isAzure() &&
            window.location.hostname !== "localhost" &&
            window.location.search.indexOf("ibiza=disabled") === -1) {

            var armId = typeof functionContainer === 'string' ? functionContainer : functionContainer.id;
            this._globalStateService.setBusyState();
            this._userService.getTenants()
                .retry(10)
                .subscribe(tenants => {
                    var currentTenant = tenants.find(t => t.Current);
                    var portalHostName = 'https://portal.azure.com';
                    var environment = '';
                    if (window.location.host.indexOf('staging') !== -1) {
                        // Temporarily redirecting FunctionsNext to use the Canary Ibiza environment.
                        environment = '?feature.fastmanifest=false&appsvc.env=stage';
                        // environment = '?websitesextension_functionsstaged=true';

                    } else if (window.location.host.indexOf('next') !== -1) {

                        // Temporarily redirecting FunctionsNext to use the Canary Ibiza environment.
                        environment = '?feature.canmodifystamps=true&BizTalkExtension=canary&WebsitesExtension=canary&feature.fastmanifest=false&appsvc.env=next';
                        // environment = '?websitesextension_functionsnext=true';
                    }

                    window.location.replace(`${portalHostName}/${currentTenant.DomainName}${environment}#resource${armId}`);
                });
            return true;
        } else {
            return false;
        }
    }
}
