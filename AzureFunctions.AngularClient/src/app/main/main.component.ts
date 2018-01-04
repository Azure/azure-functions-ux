import { FunctionAppService } from './../shared/services/function-app.service';
import { BusyStateScopeManager } from './../busy-state/busy-state-scope-manager';
import { Subject } from 'rxjs/Subject';
import { PortalService } from './../shared/services/portal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { UserService } from '../shared/services/user.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { SiteDescriptor, FunctionDescriptor } from 'app/shared/resourceDescriptors';
import { Http } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { LanguageService } from 'app/shared/services/language.service';
import { SlotsService } from 'app/shared/services/slots.service';
import { ArmService } from 'app/shared/services/arm.service';
import { ConfigService } from 'app/shared/services/config.service';
import { AuthzService } from 'app/shared/services/authz.service';
import { AiService } from 'app/shared/services/ai.service';
import { FunctionInfo } from 'app/shared/models/function-info';
import { NavigationStart, Event as RouterEvent, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
    selector: 'main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements AfterViewInit, OnDestroy {
    public ready = false;
    public resourceId: string;
    public viewInfo: TreeViewInfo<any>;
    public dashboardType: string;
    public inIFrame: boolean;
    public inTab: boolean;
    public selectedFunction: FunctionInfo;
    public showTopBar: boolean;

    @ViewChild(BusyStateComponent) busyStateComponent: BusyStateComponent;

    private _ngUnsubscribe = new Subject();
    private _busyManager: BusyStateScopeManager;

    constructor(private _userService: UserService,
        private _globalStateService: GlobalStateService,
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _functionAppService: FunctionAppService,
        _ngHttp: Http,
        _translateService: TranslateService,
        _armService: ArmService,
        _languageService: LanguageService,
        _authZService: AuthzService,
        _configService: ConfigService,
        _slotsService: SlotsService,
        _aiService: AiService,
        route: ActivatedRoute,
        router: Router) {

        router.events.takeUntil(this._ngUnsubscribe).subscribe((event: RouterEvent) => {
            this._navigationInterceptor(event);
        });

        this.inIFrame = _userService.inIFrame;
        this.inTab = _userService.inTab; // are we in a tab

        if (this.inTab) {
            this.initializeChildWindow(_userService,
                _globalStateService,
                _ngHttp,
                _translateService,
                _broadcastService,
                _armService,
                _languageService,
                _authZService,
                _configService,
                _slotsService,
                _aiService);
        }

        this._setTopBarVisibility();
    }

    private _setTopBarVisibility() {
        if (this.inIFrame) {
            this.showTopBar = false;
        } else if (!this._globalStateService.showTryView) {
            this.showTopBar = true;
        }
    }

    ngAfterViewInit() {
        this._globalStateService.GlobalBusyStateComponent = this.busyStateComponent;
        this._busyManager = new BusyStateScopeManager(this._broadcastService, 'dashboard');

        this._userService.getStartupInfo()
            .first()
            .subscribe(info => {
                this.ready = true;

                this._portalService.sendTimerEvent({
                    timerId: 'PortalReady',
                    timerAction: 'stop'
                });
            });
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
        this._busyManager.clearBusy();
    }

    private initializeChildWindow(_userService: UserService,
        _globalStateService: GlobalStateService,
        _ngHttp: Http,
        _translateService: TranslateService,
        _broadcastService: BroadcastService,
        _armService: ArmService,
        _languageService: LanguageService,
        _authZService: AuthzService,
        _configService: ConfigService,
        _slotsService: SlotsService,
        _aiService: AiService) {

        this._userService.getStartupInfo()
            .takeUntil(this._ngUnsubscribe)
            .subscribe(info => {
                // get list of functions from function app listed in resourceID
                const siteDescriptor: SiteDescriptor = new SiteDescriptor(info.resourceId);

                this._functionAppService.getAppContext(siteDescriptor.getTrimmedResourceId())
                    .mergeMap(context => this._functionAppService.getFunctions(context))
                    .subscribe(functions => {
                        const fnDescriptor: FunctionDescriptor = new FunctionDescriptor(info.resourceId);
                        const targetName: string = fnDescriptor.name;
                        // TODO: [ahmels] HANDLE RESULT. Talk to ehamai to understand the scenario.
                        const selectedFunction = functions.result.find(f => f.name === targetName);

                        if (selectedFunction) {
                            this.selectedFunction = selectedFunction;
                        } else {
                            // handle the error
                            _aiService.trackEvent(
                                '/main-component/error', {
                                    error: `Failed to find target function`
                                }
                            );
                        }
                    });
            });
    }

    updateViewInfo(viewInfo: TreeViewInfo<any>) {
        if (!viewInfo) {
            this.viewInfo = viewInfo;
            return;
        } else if (viewInfo.dashboardType === DashboardType.none) {
            return;
        }

        this.viewInfo = viewInfo;
        this.dashboardType = DashboardType[viewInfo.dashboardType];
    }

    public get trialExpired() {
        return this._globalStateService.TrialExpired;
    }

    private _navigationInterceptor(event: RouterEvent): void {
        if (!this._busyManager) {
            return;
        }

        if (event instanceof NavigationStart) {
            this._busyManager.setBusy();
        } else if (event instanceof NavigationEnd) {
            this._busyManager.clearBusy();
        } else if (event instanceof NavigationCancel) {
            this._busyManager.clearBusy();
        } else if (event instanceof NavigationError) {
            this._busyManager.clearBusy();
        }
    }
}
