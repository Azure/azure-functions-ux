import {Component, ViewChild, Input, OnChanges, SimpleChange} from '@angular/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {FunctionEditComponent} from './function-edit.component';
import {DropDownComponent} from './drop-down.component';
import {AppMonitoringComponent} from './app-monitoring.component';
import {AppSettingsComponent} from './app-settings.component';
import {TrialExpiredComponent} from './trial-expired.component';
import {FunctionsService} from '../services/functions.service';
import {UserService} from '../services/user.service';
import {PortalService} from '../services/portal.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {FunctionTemplate} from '../models/function-template';
import {ScmInfo} from '../models/scm-info';
import {Subscription} from '../models/subscription';
import {Action} from '../models/binding';
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
import {GlobalStateService} from '../services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {Cookie} from 'ng2-cookies/ng2-cookies';

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
        SourceControlComponent,
        TrialExpiredComponent
    ],
    pipes: [TranslatePipe]
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
    public trialExpired: boolean;
    public action: Action;

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {

        this._broadcastService.subscribe<any>(BroadcastEvent.FunctionNew, value => {
            this.action = <Action>value;

            var fileName = this.selectedFunction.script_href.substring(this.selectedFunction.script_href.lastIndexOf('/') + 1);
            var fileExt = fileName.split(".")[1].toLowerCase();
            var lang = "CSharp";

            switch (fileExt) {
                case "sh":
                    lang = "Bash";
                    break;
                case "bat":
                    lang = "Batch";
                    break;
                case "csx":
                    lang = "CSharp";
                    break;
                case "fsx":
                    lang = "FSharp";
                    break;
                case "js":
                    lang = "NodeJS";
                    break;
                case "php":
                    lang = "Php";
                    break;
                case "ps1":
                    lang = "Powershell";
                    break;
                case "py":
                    lang = "Python";
                    break;
            }

            var newFunc = this.functionsInfo.find((fi) => {
                return fi.name === this._translateService.instant('sideBar_newFunction');
            });
            this.selectedFunction = newFunc;
            this.action.templateId =this.action.template + "-" + lang;
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction === fi) {
                delete this.selectedFunction;
            }
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionSelected, fi => {
            this.action = null;
            this.resetView(false);
            this.sideBar.selectedFunction = fi;

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

        this._broadcastService.subscribe<void>(BroadcastEvent.TrialExpired, (event) => {
               this.trialExpired = true;
        });
    }

    // Handles the scenario where the FunctionInfo binding on the app.component has changed,
    // like for instance if we get a new resourceId from Ibiza.
    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        this.initFunctions();
    }

    initFunctions(selectedFunctionName? : string) {
        this._globalStateService.setBusyState();
        this._functionsService.clearAllCachedData();

        this._functionsService.getFunctions()
            .subscribe(res => {
                res.unshift(this._functionsService.getNewFunctionNode());
                this.functionsInfo = res;
                this._globalStateService.clearBusyState();
                this.resetView(true);
                this.openIntro = true;
                selectedFunctionName = selectedFunctionName || Cookie.get('functionName');;
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
        this.resetView(true);
        this.openAppMonitoring = true;
    }

    onAppSettingsClicked() {
        this.resetView(true);
        this.openAppSettings = true;
    }

    onQuickstartClicked() {
        this.resetView(true);
        this.openIntro = true;
    }

    onSourceControlClicked() {
        this.resetView(true);
        this.openSourceControl = true;
    }

    private resetView(clearFunction: boolean) {
        this.openAppSettings = false;
        this.openAppMonitoring = false;
        this.openIntro = null;
        this.openSourceControl = false;
        if (clearFunction) {
            this.selectedFunction = null;
            if (this.sideBar) {
                this.sideBar.selectedFunction = null;
            }
        }
    }
}