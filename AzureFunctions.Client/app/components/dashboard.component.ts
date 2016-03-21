import {Component, OnInit, ViewChild, Input} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {FunctionNewV2Component} from './function-new-v2.component';
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
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';
import {FunctionNewComponent} from './function-new.component';
import {IntroComponent} from './intro.component';
import {TutorialComponent} from './tutorial.component';
import {FunctionContainer} from '../models/function-container';
import {Observable} from 'rxjs/Rx';

@Component({
    selector: 'functions-dashboard',
    templateUrl: 'templates/dashboard.component.html',
    styleUrls: ['styles/dashboard.style.css'],
    directives: [
        SideBarComponent,
        TopBarComponent,
        FunctionNewV2Component,
        FunctionEditComponent,
        DropDownComponent,
        AppMonitoringComponent,
        AppSettingsComponent,
        FunctionNewComponent,
        IntroComponent,
        TutorialComponent
    ]
})
export class DashboardComponent implements OnInit {
    @ViewChild(SideBarComponent) sideBar: SideBarComponent;
    @Input() functionContainer: FunctionContainer;

    public functionsInfo: FunctionInfo[];
    public functionTemplates: FunctionTemplate[];
    public selectedFunction: FunctionInfo;
    public openAppMonitoring: boolean;
    public openAppSettings: boolean;
    public openIntro: boolean = true;

    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _portalService: PortalService,
        private _broadcastService: IBroadcastService) {

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction === fi) {
                delete this.selectedFunction;
            }
        });

        this._functionsService.getConfig().subscribe((config) => {
            this.setDisabled(config);
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionSelected, fi => {
            this.resetView();
            this.sideBar.selectedFunction = fi;
            
            this._broadcastService.setBusyState();
            this._functionsService.getConfig().subscribe((config) => {
                this.setDisabled(config);

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
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionUpdated, fi => {
            var index = this.functionsInfo.findIndex((f) => {
                return f.name === fi.name;
            });
            if (index !== -1) {
                this.functionsInfo[index] = fi;
            }
        });

        this._broadcastService.subscribe<void>(BroadcastEvent.GoToIntro, () => {
            this.openIntro = true;
            delete this.selectedFunction;
        });

        // TODO: What's the right way of doing something like this?
        Observable.fromEvent(document, 'click')
            .debounceTime(60000) // 1 minute
            .switchMap<string>(() => this._functionsService.warmupMainSite())
            .subscribe(e => console.log(e));
    }

    ngOnInit() {
        this._broadcastService.setBusyState();

            this._functionsService.getTemplates()
                .subscribe(res => this.functionTemplates = res);
                this.initFunctions();
            }

    initFunctions() {
        this._functionsService.getFunctions()
            .subscribe(res => {
                res.unshift(this._functionsService.getNewFunctionNode());
                this.functionsInfo = res;
                this._broadcastService.clearBusyState();
            });
        this._functionsService.warmupMainSite();
        this._functionsService.getHostSecrets();
    }

    onAppMonitoringClicked() {
        this.resetView();
        this.openAppMonitoring = true;
    }

    onAppSettingsClicked() {
        this.resetView();
        this.openAppSettings = true;
    }

    private resetView() {
        this.openAppSettings = false;
        this.openIntro = false;
        this.openAppMonitoring = false;
        this.selectedFunction = null;
        this.sideBar.selectedFunction = null;
    }

    private setDisabled(config: any) {
        if (!config["scmType"] || config["scmType"] !== "None") {
            this._broadcastService.setDirtyState("function_disabled");
            this._portalService.setDirtyState(true);
        } else {
            this._broadcastService.clearDirtyState("function_disabled", true);
            this._portalService.setDirtyState(false);
        }
    }
}