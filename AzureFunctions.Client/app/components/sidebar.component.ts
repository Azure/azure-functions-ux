import {Component, OnInit, EventEmitter, OnDestroy, Output} from '@angular/core';
import {FunctionsService} from '.././services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';
import {Observable, Subscription, Subject} from 'rxjs/Rx';
import {UserService} from '../services/user.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {SideBarFilterPipe} from '../pipes/sidebar.pipe';
import {TutorialEvent, TutorialStep} from '../models/tutorial';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {GlobalStateService} from '../services/global-state.service';
import {PortalService} from '../services/portal.service';
import {AiService} from '../services/ai.service';

enum TopbarButton {
    None = <any>"None",
    AppMonitoring = <any>"AppMonitoring",
    AppSettings = <any>"AppSettings",
    Quickstart = <any>"Quickstart",
    SourceControl = <any>"SourceControl"
}

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.component.html',
    styleUrls: ['styles/sidebar.style.css'],
    inputs: ['functionsInfo', 'tabId'],
    pipes: [SideBarFilterPipe, TranslatePipe],
})
export class SideBarComponent implements OnDestroy, OnInit {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public inIFrame: boolean;
    private showTryView: boolean;
    public pullForStatus = false;
    public running: boolean;
    public dots = "";
    public ActiveButton: TopbarButton =  TopbarButton.None;

    @Output() private appSettingsClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() private quickstartClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() refreshClicked = new EventEmitter<void>();
    @Output() changedTab = new EventEmitter<string>();
    private subscriptions: Subscription[];
    private _tabId: string = 'Develop';
    private _currentViewName: string;

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService,
        private _portalService: PortalService,
        private _aiService: AiService) {

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
            this._broadcastService.clearDirtyState('function', true);
            this._broadcastService.clearDirtyState('function_integrate', true);
            this.selectedFunction = fi;
            this._broadcastService.broadcast(BroadcastEvent.FunctionSelected, fi);
            if (fi.clientOnly) {
                this.trackPage('NewFunction');
                this.tabId = 'Develop';
            } else {
                this.trackPage(this.tabId);
            }
        }
    }

    refresh() {
        if (this.canSwitchFunctions()) {
            this.refreshClicked.emit(null);
            this._aiService.trackEvent('/actions/refresh');
        }
    }

    appsettings() {
        if (this.canSwitchFunctions()) {
            this.appSettingsClicked.emit(null);
            this.resetView();
            this.ActiveButton = TopbarButton.AppSettings;
            this.trackPage('appSettings');
        }
    }

    quickstart() {
        if (this.canSwitchFunctions()) {
            this._portalService.logAction('top-bar-azure-functions-link', 'click');
            this.resetView();
            this.quickstartClicked.emit(null);
            this.ActiveButton = TopbarButton.Quickstart;
            this.trackPage('quickStart');
        }
    }

    private trackPage(pageName: string) {
        this._aiService.stopTrackPage(this._currentViewName);
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
        if (!this._globalStateService.IsBusy) {
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
        return switchFunction;
    }
}