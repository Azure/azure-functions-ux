import { BackgroundTasksService } from './shared/services/background-tasks.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';

import { FunctionApp } from './shared/function-app';
import { BusyStateComponent } from './busy-state/busy-state.component';
import { StartupInfo } from './shared/models/portal';
import { BroadcastService } from './shared/services/broadcast.service';
import { FunctionContainer } from './shared/models/function-container';
import { GlobalStateService } from './shared/services/global-state.service';
import { UserService } from './shared/services/user.service';
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
        private _userService: UserService,
        private _globalStateService: GlobalStateService,
        // Although we are not using BackgroundTasksService, we need to reference it here.
        // Otherwise, Angular won't new it up, and it's needed for local development
        // for retrieving and updating the token.
        _backgroundTasksService: BackgroundTasksService,
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

    initializeDashboard(functionContainer: FunctionContainer | string) {
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
            window.location.hostname !== 'localhost' &&
            window.location.search.indexOf('ibiza=disabled') === -1) {

            const armId = typeof functionContainer === 'string' ? functionContainer : functionContainer.id;
            this._globalStateService.setBusyState();
            this._userService.getTenants()
                .retry(10)
                .subscribe(tenants => {
                    const currentTenant = tenants.find(t => t.Current);
                    const portalHostName = 'https://portal.azure.com';
                    let environment = '';
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
