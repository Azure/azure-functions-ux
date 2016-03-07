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

@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.component.html',
    styleUrls: ['styles/app.style.css'],
    directives: [
        SideBarComponent,
        TopBarComponent,
        FunctionNewV2Component,
        FunctionEditComponent,
        DropDownComponent,
        AppSettingsComponent,
        FunctionNewComponent
    ]
})
export class AppComponent implements OnInit{
    @ViewChild(SideBarComponent) sideBar: SideBarComponent;

    public functionsInfo: FunctionInfo[];
    public subscriptions: DropDownElement<Subscription>[];
    public serverFarms: DropDownElement<ServerFarm>[];
    public _serverFarms: DropDownElement<ServerFarm>[];
    public selectedSubscription: Subscription;
    public selectedServerFarm: ServerFarm;
    public functionTemplates: FunctionTemplate[];
    public selectedFunction: FunctionInfo;
    public noContainerFound: boolean;
    public noTenantsFound: boolean;
    public subscriptionPickerPlaceholder: string;
    public serverFarmPickerPlaceholder: string;
    public geoRegions: DropDownElement<string>[];
    public selectedGeoRegion: string;
    public resetServerFarm: boolean;
    public openAppSettings: boolean;

    private initializing: boolean;
    private tryAppServiceTenantId: string = "6224bcc1-1690-4d04-b905-92265f948dad";

    constructor(private _functionsService: FunctionsService,
                private _userService: UserService,
                private _portalService: PortalService,
                private _broadcastService: IBroadcastService) {

        this.noContainerFound = false;
        this.noTenantsFound = false;
        this.subscriptionPickerPlaceholder = 'Select Subscription';
        this.serverFarmPickerPlaceholder = 'Select Server Farm (optional)';
        this.geoRegions = [
            'East Asia',
            'North Europe',
            'West Europe',
            'Southeast Asia',
            'West US',
            'East US',
            'Japan West',
            'Japan East',
            'South Central US',
            'East US 2',
            'North Central US',
            'Central US',
            'Brazil South',
            'Australia East',
            'Australia Southeast',
            'Central India',
            'West India',
            'South India']
        .map(e => ({displayLabel: e, value: e}))
        .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));


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
    }

    ngOnInit() {
        this.initializing = true;
        this._functionsService.getTemplates()
            .subscribe(res => this.functionTemplates = res);
        if (this._portalService.inIFrame) {
            this._portalService.initializeIframe((token : string) => {
                this._functionsService.setToken(token);
                this.initializeUser() 
            });
        }
        else {
            this.initializeUser();
        }
    }

    private initializeUser(){
        this._functionsService.initializeUser()
            .subscribe(r => {
                if (!r) {
                    // No Container. Ask the user to pick.
                    //get a list of subs and ask the user to chose.
                    this._userService.getTenants()
                        .subscribe(res => {
                            this.initializing = false;
                            if (res.filter(e => e.TenantId.toLocaleLowerCase() !== this.tryAppServiceTenantId).length === 0) {
                                // Try It Now
                                this.noTenantsFound = true;
                            } else {
                                this.noContainerFound = true;
                                // Normal Stuff
                                this._functionsService.getSubscriptions()
                                    .subscribe(res => {
                                        this.subscriptions = res
                                            .map(e => ({ displayLabel: e.displayName, value: e }))
                                            .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
                                    });
                                this._functionsService.getServerFarms()
                                    .subscribe(res => {
                                        this.serverFarms = res
                                            .map(e => ({ displayLabel: e.serverFarmName, value: e }))
                                            .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
                                    });
                            }
                        });

                } else {
                    this.initFunctions();
                }
            });
    }

    initFunctions() {
        this.noContainerFound = false;
        this._functionsService.redirectToIbizaIfNeeded();
        this._functionsService.getFunctions()
            .subscribe(res => {
                res.unshift(this._functionsService.getNewFunctionNode());
                res.unshift(this._functionsService.getNewFunctionNode());
                res[1].name = "New Function (V2)";
                this.functionsInfo = res;
                this.initializing = false;
            });
        this._functionsService.warmupMainSite();
        this._functionsService.getHostSecrets();
    }

    createFunctionsContainer() {
        this.initializing = true;
        var serverFarmId = this.selectedServerFarm ? this.selectedServerFarm.armId : null;
        this._functionsService.createFunctionsContainer(this.selectedSubscription.subscriptionId, this.selectedGeoRegion, serverFarmId)
            .subscribe(r => this.initFunctions());
    }

    onSubscriptionSelect(value: Subscription) {
        this.selectedSubscription = value;
        delete this.selectedServerFarm;
        this.resetServerFarm = !this.resetServerFarm;
        this._serverFarms = this.serverFarms.filter(e => e.value.subscriptionId.toLocaleLowerCase() === value.subscriptionId &&
                                                         this.selectedGeoRegion &&
                                                         e.value.geoRegion.toLocaleLowerCase() === this.selectedGeoRegion.toLocaleLowerCase());
    }

    onGeoRegionChange(value: string) {
        this.selectedGeoRegion = value;
        delete this.selectedServerFarm;
        this.resetServerFarm = !this.resetServerFarm;
        this._serverFarms = this.serverFarms.filter(e => e.value.subscriptionId.toLocaleLowerCase() === this.selectedSubscription.subscriptionId &&
                                                         e.value.geoRegion.toLocaleLowerCase() === value.toLocaleLowerCase());
    }

    createTrialFunctionsContainer() {
        this.initializing = true;
        this._functionsService.createTrialFunctionsContainer()
            .subscribe(r => this.switchToTryAppServiceTenant());
    }

    switchToTryAppServiceTenant() {
        window.location.href = `api/switchtenants/${this.tryAppServiceTenantId}${window.location.search}`;
    }

    onAppSettingsClicked(){
        this.resetView();
        this.openAppSettings = true;
    }

    private resetView(){
        this.openAppSettings = false;
        this.selectedFunction = null;
        this.sideBar.selectedFunction = null;
    }
}