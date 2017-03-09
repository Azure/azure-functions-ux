import {Component, OnInit, EventEmitter, OnDestroy, Output, Input} from '@angular/core';
import {FunctionsService} from '../shared/services/functions.service';
import {FunctionInfo} from '../shared/models/function-info';
import {FunctionConfig} from '../shared/models/function-config';
import {VfsObject} from '../shared/models/vfs-object';
import {Observable, Subscription, Subject} from 'rxjs/Rx';
import {UserService} from '../shared/services/user.service';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {TutorialEvent, TutorialStep} from '../shared/models/tutorial';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {GlobalStateService} from '../shared/services/global-state.service';
import {PortalService} from '../shared/services/portal.service';
import {AiService} from '../shared/services/ai.service';
import {ApiProxy} from '../shared/models/api-proxy';

enum TopbarButton {
    None = <any>"None",
    AppMonitoring = <any>"AppMonitoring",
    AppSettings = <any>"AppSettings",
    Quickstart = <any>"Quickstart",
    SourceControl = <any>"SourceControl",
}

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  inputs: ['functionsInfo', 'tabId'],
})
export class SidebarComponent implements OnDestroy, OnInit {
    @Input() apiProxies: ApiProxy[];
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public selectedApiProxy: ApiProxy;
    public inIFrame: boolean;
    public showTryView: boolean;
    public pullForStatus = false;
    public running: boolean;
    public dots = "";
    public ActiveButton: TopbarButton = TopbarButton.None;
    public apiProxyEnabled: boolean;

    @Output() private appSettingsClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() private quickstartClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() private apiSettingsClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() private newApiProxyClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() refreshClicked = new EventEmitter<void>();
    @Output() changedTab = new EventEmitter<string>();
    private subscriptions: Subscription[];
    private _tabId: string = 'Develop';
    private _currentViewName: string;
    private interval: number;

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService,
        private _portalService: PortalService,
        private _aiService: AiService) {

        this.showTryView = this._globalStateService.showTryView;
        this.subscriptions = [];
        this.inIFrame = this._userService.inIFrame;
        this.showTryView = this._globalStateService.showTryView;

        this.subscriptions.push(this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction.name === fi.name) delete this.selectedFunction;
            for (var i = 0; i < this.functionsInfo.length; i++) {
                if (this.functionsInfo[i].name === fi.name) {
                    this.functionsInfo.splice(i, 1);
                    break;
                }
            }
            this.clearDirtyStates();
        }));

        this.subscriptions.push(this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionAdded, fi => {
            if (this.functionsInfo) {
                this.functionsInfo.push(fi);
                this.functionsInfo.sort((f1, f2) => {
                    if (f1.name === this._translateService.instant(PortalResources.sideBar_newFunction)) {
                        return -1;
                    }
                    if (f2.name === this._translateService.instant(PortalResources.sideBar_newFunction)) {
                        return 1;
                    }

                    return f1.name.localeCompare(f2.name);
                });
                this.selectFunction(fi);
            }
        }));

        this.subscriptions.push(this._broadcastService.subscribe<ApiProxy>(BroadcastEvent.ApiProxyAdded, apiProxy => {
            if (apiProxy) {
                this.apiProxies.push(apiProxy);
                this.selectApiProxy(apiProxy);

            }
        }));

        this.subscriptions.push(this._broadcastService.subscribe<ApiProxy>(BroadcastEvent.ApiProxyDeleted, apiProxy => {
            if (this.selectedApiProxy && this.selectedApiProxy.name === apiProxy.name) delete this.selectApiProxy;
            for (var i = 0; i < this.apiProxies.length; i++) {
                if (this.apiProxies[i].name === apiProxy.name) {
                    this.apiProxies.splice(i, 1);
                    break;
                }
            }
            this.clearDirtyStates();
        }));

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, (event) => {
            if (event && event.step === TutorialStep.NextSteps) {
                let selectedFi = this.functionsInfo.find(fi => fi === event.functionInfo);
                this.selectFunction(selectedFi);
            }
        });

        this.subscriptions.push(this._broadcastService.subscribe<any>(BroadcastEvent.FunctionNew, (action) => {
            var newFunc = this.functionsInfo.find((fi) => {
                return fi.name === this._translateService.instant('sideBar_newFunction');
            });
            if (newFunc) {
                this.selectFunction(newFunc);
            }
        }));

        this._broadcastService.subscribe<TutorialEvent>(BroadcastEvent.TutorialStep, event => {
            if (event && event.step === TutorialStep.AppSettings) {
                this.appsettings();
            }
        });

        this.showTryView = this._globalStateService.showTryView;
        if (this.showTryView && this.functionsInfo) {
            let selectedFi = this.functionsInfo.find(fi => fi.name === this._functionsService.selectedFunctionName);
            this.selectFunction(selectedFi);
        }

        this._globalStateService.enabledApiProxy.subscribe((value) => {
            this.apiProxyEnabled = value;
        });

        this.apiProxyEnabled = this._globalStateService.enabledApiProxy.getValue();
    }

    ngOnInit() {
        this._currentViewName = 'quickStart';
        this._aiService.startTrackPage(this._currentViewName);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    selectFunction(fi: FunctionInfo) {
        if (this.canSwitchFunctions()) {
            this.resetView();
            this.clearDirtyStates();
            this.selectedFunction = fi;
            this.selectedApiProxy = null;
            this._broadcastService.broadcast(BroadcastEvent.FunctionSelected, fi);
            if (fi.clientOnly) {
                this.trackPage('NewFunction');
                this.tabId = 'Develop';
            } else {
                this.trackPage(this.tabId);
            }
        }
    }

    selectApiProxy(p: ApiProxy) {

        if (this.canSwitchFunctions()) {
            this.resetView();
            this.clearDirtyStates();
            this.selectedApiProxy = p;
            this.selectedFunction = null;
            this._broadcastService.broadcast(BroadcastEvent.ApiProxySelected, p);
            if (p.name === this._translateService.instant(PortalResources.sidebar_newApiProxy)) {
                this.trackPage('NewApiProxy');
            } else {
                this.trackPage('DetailsFunction');
            }
        }
    }

    refresh() {
        if (this.canSwitchFunctions()) {
            this.clearDirtyStates();
            this.refreshClicked.emit(null);
            this._aiService.trackEvent('/actions/refresh');
            this._functionsService.fireSyncTrigger();
        }
    }

    appsettings(emit: boolean = true) {
        if (this.canSwitchFunctions()) {
            if (emit) {
                this.appSettingsClicked.emit(null);
            }
            this.resetView();
            this.ActiveButton = TopbarButton.AppSettings;
            this.trackPage('appSettings');
            this.tabId = 'Develop';
        }
    }

    quickstart() {
        if (this.canSwitchFunctions()) {
            this._portalService.logAction('side-azure-functions-link', 'click');
            this.resetView();
            this.quickstartClicked.emit(null);
            this.ActiveButton = TopbarButton.Quickstart;
            this.trackPage('quickStart');
            this.tabId = 'Develop';
        }
    }

    private trackPage(pageName: string) {
        this._aiService.stopTrackPage(this._currentViewName, '/tabs');
        this._aiService.startTrackPage(pageName);
        this._currentViewName = pageName;
    }

    private resetView() {
        this.ActiveButton = TopbarButton.None;
    }

    get tabId(): string {
        return this._tabId;
    }

    set tabId(value: string) {
        this._tabId = value;
    }

    onTabClicked(tabId: string) {
        if (this.canSwitchFunctions()) {
            this.clearDirtyStates();
            this._globalStateService.clearBusyState();
            this._portalService.logAction("tabs", "click " + tabId, null);
            this._tabId = tabId;
            this.trackPage(tabId);
            this.changedTab.emit(tabId);
        }
    }

    private canSwitchFunctions() {
        var switchFunction = true;
        if ((this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate')) && this.selectedFunction) {
            switchFunction = confirm(this._translateService.instant(PortalResources.sideBar_changeMade, { name: this.selectedFunction.name }));
        }
        if (this._broadcastService.getDirtyState('api-proxy') && this.selectedApiProxy) {
            switchFunction = confirm(this._translateService.instant(PortalResources.sideBar_changeMadeApiProxy, { name: this.selectedApiProxy.name }));
        }
        return switchFunction;
    }

    private clearDirtyStates() {
        this._broadcastService.clearDirtyState('function', true);
        this._broadcastService.clearDirtyState('function_integrate', true);
        this._broadcastService.clearDirtyState('api-proxy', true);
    }
}