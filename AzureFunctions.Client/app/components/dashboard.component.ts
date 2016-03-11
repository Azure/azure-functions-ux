import {Component, OnInit, ViewChild} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {FunctionNewV2Component} from './function-new-v2.component';
import {FunctionEditComponent} from './function-edit.component';
import {DropDownComponent} from './drop-down.component';
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
        AppSettingsComponent,
        FunctionNewComponent,
        IntroComponent
    ]
})
export class DashboardComponent implements OnInit {
    @ViewChild(SideBarComponent) sideBar: SideBarComponent;

    public functionsInfo: FunctionInfo[];
    public functionTemplates: FunctionTemplate[];
    public selectedFunction: FunctionInfo;
    public openAppSettings: boolean;


    constructor(private _functionsService: FunctionsService,
        private _userService: UserService,
        private _portalService: PortalService,
        private _broadcastService: IBroadcastService) {

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionDeleted, fi => {
            if (this.selectedFunction === fi) {
                delete this.selectedFunction;
            }
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionSelected, fi => {            
            this.resetView();
            this.selectedFunction = fi;
            this.sideBar.selectedFunction = fi;
        });

        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.FunctionUpdated, fi => {
            var index = this.functionsInfo.findIndex((f) => {
                return f.name === fi.name;
            });
            if (index !== -1) {
                this.functionsInfo[index] = fi;
            }
        });
    }

    ngOnInit() {
        this._broadcastService.setBusyState();

        if (this._portalService.inIFrame) {
            this._portalService.initializeIframe((token: string) => {
                this._functionsService.setToken(token);
                this._functionsService.getTemplates()
                    .subscribe(res => this.functionTemplates = res);
                this._functionsService.initializeUser()
                    .subscribe(r => this.initFunctions());
            });
        }
        else {
            this._functionsService.getTemplates()
                .subscribe(res => this.functionTemplates = res);
            this.initFunctions();
        }
    }

    initFunctions() {
        this._functionsService.redirectToIbizaIfNeeded();
        this._functionsService.getFunctions()
            .subscribe(res => {
                res.unshift(this._functionsService.getNewFunctionNode());
                res.unshift(this._functionsService.getNewFunctionNode());
                res[1].name = "New Function (V2)";
                this.functionsInfo = res;
                this._broadcastService.clearBusyState();
            });
        this._functionsService.warmupMainSite();
        this._functionsService.getHostSecrets();
    }


    onAppSettingsClicked() {
        this.resetView();
        this.openAppSettings = true;
    }

    private resetView() {
        this.openAppSettings = false;
        this.selectedFunction = null;
        this.sideBar.selectedFunction = null;
    }
}