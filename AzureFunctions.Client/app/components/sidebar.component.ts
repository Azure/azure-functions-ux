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
export class SideBarComponent implements OnDestroy {
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
    private _tabId: string = "Develop";

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService,
        private _portalService: PortalService) {

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

        this.showTryView = this._globalStateService.showTryView;
        if (this.showTryView && this.functionsInfo) {
            let selectedFi = this.functionsInfo.find(fi => fi.name === this._functionsService.selectedFunctionName);
            this.selectFunction(selectedFi);
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    selectFunction(fi: FunctionInfo) {
        if (this.switchFunctions()) {
            this.resetView();
            this._broadcastService.clearDirtyState('function', true);
            this._broadcastService.clearDirtyState('function_integrate', true);
            this.selectedFunction = fi;
            this._broadcastService.broadcast(BroadcastEvent.FunctionSelected, fi);
        }
    }

    refresh() {
        if (this.switchFunctions()) {
            this.refreshClicked.emit(null);
        }
    }

    appsettings() {
        if (this.switchFunctions()) {            
            this.appSettingsClicked.emit(null);
            this.resetView();
            this.ActiveButton = TopbarButton.AppSettings;
        }

    }


    quickstart() {
        if (this.switchFunctions()) {
            this._portalService.logAction('top-bar-azure-functions-link', 'click');
            this.resetView();
            this.quickstartClicked.emit(null);
            this.ActiveButton = TopbarButton.Quickstart;
        }

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
            this.changedTab.emit(tabId);
        }
    }

    private switchFunctions() {
        var switchFunction = true;
        if ((this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate')) && this.selectedFunction) {
            switchFunction = confirm(this._translateService.instant(PortalResources.sideBar_changeMade, { name: this.selectedFunction.name }));
        }
        return switchFunction;
    }

}