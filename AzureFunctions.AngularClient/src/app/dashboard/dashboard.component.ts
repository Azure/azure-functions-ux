import { Observable } from 'rxjs/Rx';
import {Component, ViewChild, Input, OnChanges, SimpleChange} from '@angular/core';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {FunctionsService} from '../shared/services/functions.service';
import {UserService} from '../shared/services/user.service';
import {PortalService} from '../shared/services/portal.service';
import {FunctionInfo, FunctionInfoHelper} from '../shared/models/function-info';
import {VfsObject} from '../shared/models/vfs-object';
import {FunctionTemplate} from '../shared/models/function-template';
import {ScmInfo} from '../shared/models/scm-info';
import {Subscription} from '../shared/models/subscription';

import {Action} from '../shared/models/binding';
import {DropDownElement} from '../shared/models/drop-down-element';
import {ServerFarm} from '../shared/models/server-farm';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {FunctionContainer} from '../shared/models/function-container';
import {ErrorEvent} from '../shared/models/error-event';

import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {Cookie} from 'ng2-cookies/ng2-cookies';

import {TutorialEvent, TutorialStep} from '../shared/models/tutorial';
import {Response, ResponseType} from '@angular/http';
import {ArmService} from '../shared/services/arm.service';
import {ApiProxy} from '../shared/models/api-proxy';


@Component({
  selector: 'functions-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnChanges {
    @ViewChild(SidebarComponent) sideBar: SidebarComponent;
    @Input() functionContainer: FunctionContainer;

    public functionsInfo: FunctionInfo[];
    public apiProxies: ApiProxy[];
    public selectedFunction: FunctionInfo;
    public selectedApiProxy: ApiProxy;
    public openAppMonitoring: boolean;
    public openAppSettings: boolean;
    public openSourceControl: boolean;
    public openIntro: boolean = true;
    public openNewApiProxy: boolean;
    public trialExpired: boolean;
    public action: Action;
    public tabId: string = "Develop";
    private disabled: boolean = false;

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _armService: ArmService) {

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, event => {
            let selectedTabId: string;
            switch (event.step) {
                case TutorialStep.Develop:
                case TutorialStep.NextSteps:
                    selectedTabId = "Develop";
                    break;
                case TutorialStep.Integrate:
                    selectedTabId = "Integrate"
                    break;
                default:
                    break;
            }

            if (selectedTabId) {
                this.onChangeTab(selectedTabId);
            }
        });

        this._broadcastService.subscribe<any>(BroadcastEvent.FunctionNew, value => {
            this.action = <Action>value;

            var newFunc = this.functionsInfo.find((fi) => {
                return fi.name === this._translateService.instant('sideBar_newFunction');
            });
            this.selectedFunction = newFunc;
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction === fi) {
                delete this.selectedFunction;
            }
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionSelected, fi => {
            if (fi.config) {
                this.action = null;
            }
            this.resetView(false);
            this.sideBar.selectedFunction = fi;
            this.selectedApiProxy = null;

            this._globalStateService.setBusyState();

            if (fi.name !== this._translateService.instant(PortalResources.sideBar_newFunction)) {
                this._functionsService.getFunction(fi).subscribe((fi) => {
                    this.selectedFunction = fi;
                    this._globalStateService.clearBusyState();
                });
            } else {
                this.selectedFunction = fi;
                this._globalStateService.clearBusyState();
            }

        });

        this._broadcastService.subscribe<ApiProxy>(BroadcastEvent.ApiProxySelected, apiProxy => {
            this.resetView(false);
            this.selectedApiProxy = apiProxy;
            this.selectedFunction = null;
        });

        this._broadcastService.subscribe<ApiProxy>(BroadcastEvent.ApiProxyDeleted, apiProxy => {
            if (this.selectedApiProxy === apiProxy) {
                delete this.selectedApiProxy;
            }
        });

        this._broadcastService.subscribe<void>(BroadcastEvent.TrialExpired, (event) => {
            this.trialExpired = true;
        });

        this._globalStateService.DashboardComponent = this;
    }

    // Handles the scenario where the FunctionInfo binding on the app.component has changed,
    // like for instance if we get a new resourceId from Ibiza.
    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (!this._globalStateService.GlobalDisabled) {
            this.initFunctions();
        }
    }

    initFunctions() {
        this._globalStateService.setBusyState();
        this._functionsService.clearAllCachedData();

        Observable.zip(
            this._functionsService.getHostSecretsFromScm(),
            this._functionsService.getFunctions(),
            (keys, functions) => ({keys: keys, functions: functions}))
            .subscribe(res => {
                res.functions = Array.isArray(res.functions) ? res.functions : [];
                res.functions.unshift(this._functionsService.getNewFunctionNode());
                this.functionsInfo = res.functions;
                this._globalStateService.clearBusyState();
                let selectedFunctionName = (this.selectedFunction ?  this.selectedFunction.name : null ) || Cookie.get('functionName');
                if (selectedFunctionName) {
                    let findSelected = this.functionsInfo.find((f) => {
                        return f.name === selectedFunctionName;
                    });
                    if (findSelected) {
                        this.openIntro = false;
                        this.selectedFunction = findSelected;
                        this.sideBar.selectedFunction = findSelected;
                    }
                }
            },
            (error: Response) => {
                this._globalStateService.clearBusyState();
                this.functionsInfo = [];
            });

        this._functionsService.getApiProxies().subscribe(proxies => {
            this.apiProxies = ApiProxy.fromJson(proxies);

            this.apiProxies.unshift({
                name: this._translateService.instant(PortalResources.sidebar_newApiProxy),
                backendUri: '',
                matchCondition: {
                    methods: [],
                    route: ''
                }
            });

            let selectedApiName = this.selectedApiProxy ? this.selectedApiProxy.name : null;
            if (selectedApiName) {
                let findSelected = this.apiProxies.find((f) => {
                    return f.name === selectedApiName;
                });
                if (selectedApiName) {
                    this.openIntro = false;
                    this.selectedApiProxy = findSelected;
                    this.sideBar.selectedApiProxy = findSelected;
                }
            }

        });

        this._functionsService.warmupMainSite();
    }

    onRefreshClicked() {
        this.initFunctions();
        this._broadcastService.broadcast(BroadcastEvent.RefreshPortal);
    }

    onChangeTab(event: string) {
        setTimeout(() => {
            this.tabId = event;
        });
    }

    onAppMonitoringClicked() {
        this.resetView(true);
        this.openAppMonitoring = true;
    }

    onAppSettingsClicked() {
        this.resetView(true);
        this.openAppSettings = true;
        this.sideBar.appsettings(false);
    }

    onQuickstartClicked() {
        this.resetView(true);
        this.openIntro = true;
    }

    onSourceControlClicked() {
        this.resetView(true);
        this.openSourceControl = true;
    }

    onNewApiProxyClicked() {
        this.resetView(true);
        this.openNewApiProxy = true;
    }

    private resetView(clearSelected: boolean) {
        this.openAppSettings = false;
        this.openAppMonitoring = false;
        this.openIntro = null;
        this.openSourceControl = false;
        this.openNewApiProxy = false;
        if (clearSelected) {
            this.selectedFunction = null;
            this.selectedApiProxy = null;
            if (this.sideBar) {
                this.sideBar.selectedFunction = null;
                this.sideBar.selectedApiProxy = null;
            }
        }
    }
}
