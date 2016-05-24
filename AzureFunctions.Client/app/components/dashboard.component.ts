import {Component, ViewChild, Input, OnChanges, SimpleChange} from '@angular/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {FunctionEditComponent} from './function-edit.component';
import {DropDownComponent} from './drop-down.component';
import {AppMonitoringComponent} from './app-monitoring.component';
import {AppSettingsComponent} from './app-settings.component';
import {FunctionsService} from '../services/functions.service';
import {UserService} from '../services/user.service';
import {PortalService} from '../services/portal.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {FunctionTemplate} from '../models/function-template';
import {ScmInfo} from '../models/scm-info';
import {Subscription} from '../models/subscription';
import {DropDownElement} from '../models/drop-down-element';
import {ServerFarm} from '../models/server-farm';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {FunctionNewComponent} from './function-new.component';
import {IntroComponent} from './intro.component';
import {TutorialComponent} from './tutorial.component';
import {FunctionContainer} from '../models/function-container';
import {ErrorEvent} from '../models/error-event';
import {SourceControlComponent} from './source-control.component';

@Component({
    selector: 'functions-dashboard',
    templateUrl: 'templates/dashboard.component.html',
    styleUrls: ['styles/dashboard.style.css'],
    directives: [
        SideBarComponent,
        TopBarComponent,
        FunctionEditComponent,
        DropDownComponent,
        AppMonitoringComponent,
        AppSettingsComponent,
        FunctionNewComponent,
        IntroComponent,
        TutorialComponent,
        SourceControlComponent
    ]
})
export class DashboardComponent implements OnChanges {
    @ViewChild(SideBarComponent) sideBar: SideBarComponent;
    @Input() functionContainer: FunctionContainer;

    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public openAppMonitoring: boolean;
    public openAppSettings: boolean;
    public openSourceControl: boolean;
    public openIntro: any;

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _portalService: PortalService,
        private _broadcastService: BroadcastService) {

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction === fi) {
                delete this.selectedFunction;
            }
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionSelected, fi => {
            this.resetView();
            this.sideBar.selectedFunction = fi;

            this._broadcastService.setBusyState();

            if(fi.name !== "New Function") {
                this._functionsService.getFunction(fi).subscribe((fi) => {
                    this.selectedFunction = fi;
                    this._broadcastService.clearBusyState();
                });
            } else {
                this.selectedFunction = fi;
                this._broadcastService.clearBusyState();
            }

        });
    }

    // Handles the scenario where the FunctionInfo binding on the app.component has changed,
    // like for instance if we get a new resourceId from Ibiza.
    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        this.initFunctions();
    }

    initFunctions(selectedFunctionName? : string) {
        this._broadcastService.setBusyState();

        this._functionsService.getFunctions()
            .subscribe(res => {
                res.unshift(this._functionsService.getNewFunctionNode());
                this.functionsInfo = res;
                this._broadcastService.clearBusyState();
                this.resetView();
                this.openIntro = true;

                if (selectedFunctionName) {
                    var findSelected = this.functionsInfo.find((f) => {
                        return f.name === selectedFunctionName;
                    });
                    if (findSelected) {
                        this.openIntro = false;
                        this.selectedFunction = findSelected;
                        this.sideBar.selectedFunction = findSelected;
                    }
                }
            });
        this._functionsService.warmupMainSite();
        this._functionsService.getHostSecrets();
    }

    onRefreshClicked() {
        this.initFunctions(this.selectedFunction ? this.selectedFunction.name : null);
    }

    onAppMonitoringClicked() {
        this.resetView();
        this.openAppMonitoring = true;
    }

    onAppSettingsClicked() {
        this.resetView();
        this.openAppSettings = true;
    }

    onQuickstartClicked() {
        this.resetView();
        this.openIntro = true;
    }

    onSourceControlClicked() {
        this.resetView();
        this.openSourceControl = true;
    }

    private resetView() {
        this.openAppSettings = false;
        this.openAppMonitoring = false;
        this.openIntro = null;
        this.openSourceControl = false;
        this.selectedFunction = null;
        this.sideBar.selectedFunction = null;
    }
}