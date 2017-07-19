import { FunctionApp } from './../shared/function-app';
import { TopRightMenuComponent } from './../top-right-menu/top-right-menu.component';
import { Component, OnInit, ViewChild, AfterViewInit, Input, Output } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { UserService } from '../shared/services/user.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { FunctionEditComponent } from '../function-edit/function-edit.component';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { CacheService } from "app/shared/services/cache.service";
import { ArmObj } from "app/shared/models/arm/arm-obj";
import { Site } from "app/shared/models/arm/site";
import { SiteDescriptor, Descriptor, FunctionDescriptor } from "app/shared/resourceDescriptors";
import { Http } from "@angular/http";
import { TranslateService, TranslatePipe } from '@ngx-translate/core';;
import { BroadcastService } from "app/shared/services/broadcast.service";
import { LanguageService } from "app/shared/services/language.service";
import { SlotsService } from "app/shared/services/slots.service";
import { ArmService } from "app/shared/services/arm.service";
import { ConfigService } from "app/shared/services/config.service";
import { AuthzService } from "app/shared/services/authz.service";
import { AiService } from "app/shared/services/ai.service";
import { FunctionInfo } from "app/shared/models/function-info";

@Component({
    selector: 'main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements AfterViewInit {
    public resourceId: string;
    public viewInfo: TreeViewInfo<any>;
    public dashboardType: string;
    public inIFrame: boolean;
    public inTab: boolean;
    public selectedFunction: FunctionInfo;

    @ViewChild(BusyStateComponent) busyStateComponent: BusyStateComponent;

    @Input() tryFunctionApp: FunctionApp;

    constructor(private _userService: UserService,
        private _globalStateService: GlobalStateService,
        private _cacheService: CacheService,
        _ngHttp: Http,
        _translateService: TranslateService,
        _broadcastService: BroadcastService,
        _armService: ArmService,
        _languageService: LanguageService,
        _authZService: AuthzService,
        _configService: ConfigService,
        _slotsService: SlotsService,
        _aiService: AiService) {

        this.inIFrame = _userService.inIFrame;
        this.inTab = _userService.inTab; // are we in a tab

        if (this.inTab) {
            this.initializeChildWindow(_userService,
                _globalStateService,
                _cacheService,
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
    }

    private initializeChildWindow(_userService: UserService,
        _globalStateService: GlobalStateService,
        _cacheService: CacheService,
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
            .subscribe(info => {
                // get list of functions from function app listed in resourceID
                let siteDescriptor: SiteDescriptor = new SiteDescriptor(info.resourceId);

                this._cacheService.getArm(siteDescriptor.getResourceId())
                    .mergeMap(response => {
                        let site = <ArmObj<Site>>response.json();
                        let functionApp: FunctionApp = new FunctionApp(site,
                            _ngHttp,
                            _userService,
                            _globalStateService,
                            _translateService,
                            _broadcastService,
                            _armService,
                            _cacheService,
                            _languageService,
                            _authZService,
                            _aiService,
                            _configService,
                            _slotsService);
                        return functionApp.getFunctions()
                    })
                    .subscribe(functions => {
                        const fnDescriptor: FunctionDescriptor = new FunctionDescriptor(info.resourceId);
                        const targetName: string = fnDescriptor.functionName
                        const selectedFunction = functions.find(f => f.name === targetName);

                        if (selectedFunction) {
                            this.selectedFunction = selectedFunction;
                        } else {
                            // handle the error
                            _aiService.trackEvent(
                                '/main-component/error', {
                                    error: `Failed to find target function`
                                }
                            )
                        }
                    })
            })
    }

    updateViewInfo(viewInfo: TreeViewInfo<any>) {
        if (!viewInfo) {
            this.viewInfo = viewInfo;
            return;
        }
        else if (viewInfo.dashboardType === DashboardType.none) {
            return;
        }

        this.viewInfo = viewInfo;
        this.dashboardType = DashboardType[viewInfo.dashboardType];
    }

    ngAfterViewInit() {
        this._globalStateService.clearBusyState();
        this._globalStateService.GlobalBusyStateComponent = this.busyStateComponent;
    }

    public get trialExpired() {
        return this._globalStateService.TrialExpired;
    }

}
