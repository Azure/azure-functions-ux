import { BusyStateComponent } from './busy-state/busy-state.component';
import { environment } from './../environments/environment.prod';
import { StartupInfo } from './shared/models/portal';
import { BroadcastService } from './shared/services/broadcast.service';
import { FunctionContainer } from './shared/models/function-container';
import { GlobalStateService } from './shared/services/global-state.service';
import { LanguageService } from './shared/services/language.service';
import { BackgroundTasksService } from './shared/services/background-tasks.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {DashboardComponent} from './dashboard/dashboard.component';
import {PortalService} from './shared/services/portal.service';
import {ArmService} from './shared/services/arm.service';
import {UserService} from './shared/services/user.service';
import {FunctionsService} from './shared/services/functions.service';
import {Observable} from 'rxjs/Rx';
import {ErrorListComponent} from './error-list/error-list.component';
import {MainComponent} from './main/main.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})

export class AppComponent implements OnInit, AfterViewInit {
    public gettingStarted: boolean;
    public ready: boolean;
    private _startupInfo : StartupInfo;
    // public currentResourceId: string;

    @ViewChild(BusyStateComponent) busyStateComponent: BusyStateComponent;

    constructor(
        private _portalService: PortalService,
        private _armService: ArmService,
        private _userService: UserService,
        private _functionsService : FunctionsService,
        private _backgroundTasksService : BackgroundTasksService,
        private _languageService : LanguageService,
        private _globalStateService : GlobalStateService,
        private _broadcastService : BroadcastService
    ) {
        this.ready = false;

        if (_userService.inIFrame ||
            window.location.protocol === 'http:') {
            this.gettingStarted = false;
            return;
        } else {
            this.gettingStarted = true;
        }
    }

    ngOnInit() {
        this._userService.getStartupInfo()
            .flatMap(startupInfo =>{
                this._startupInfo = startupInfo;
                return this._languageService.getResources(null);
            })
            .subscribe(info => {
                this.ready = true;
            });
    }

    ngAfterViewInit() {
        this._globalStateService.GlobalBusyStateComponent  = this.busyStateComponent;
        // this._globalStateService.LocalDevelopmentInstructionsComponent = this.localDevelopment;
    }

    initializeDashboard(functionContainer: FunctionContainer | string, appSettingsAccess?: boolean) {
        this._globalStateService.setBusyState();
        // if (typeof functionContainer !== 'string')
        //     //TODO: investigate this
        //     this.showTryView = functionContainer.tryScmCred === null;

        if (this.redirectToIbizaIfNeeded(functionContainer)) return;

        if (typeof functionContainer !== 'string') {
            this._broadcastService.clearAllDirtyStates();

            this._startupInfo.resourceId = functionContainer.id;
            this._userService.updateStartupInfo(this._startupInfo);
            this.gettingStarted = false;
        }
    }

    private redirectToIbizaIfNeeded(functionContainer: FunctionContainer | string): boolean {
        if (!this._userService.inIFrame &&
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
                        environment = '?websitesextension_functionsstaged=true';
                    } else if (window.location.host.indexOf('next') !== -1) {

                        // Temporarily redirecting FunctionsNext to use the CanaryF2 Ibiza environment.
                        environment = '?feature.canmodifystamps=true&BizTalkExtension=f2&WebsitesExtension=f2&feature.fastmanifest=false&appsvc.env=next';
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