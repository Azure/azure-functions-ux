import {Component, OnInit} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {NewFunctionComponent} from './new-function.component';
import {FunctionEditComponent} from './function-edit.component';
import {DropDownComponent} from './drop-down.component';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {FunctionTemplate} from '../models/function-template';
import {ScmInfo} from '../models/scm-info';
import {Subscription} from '../models/subscription';
import {DropDownElement} from '../models/drop-down-element';
import {ServerFarm} from '../models/server-farm';


@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.html',
    directives: [SideBarComponent, TopBarComponent, NewFunctionComponent, FunctionEditComponent, DropDownComponent]
})
export class AppComponent implements OnInit{
    public functionsInfo: FunctionInfo[];
    public subscriptions: DropDownElement<Subscription>[];
    public serverFarms: DropDownElement<ServerFarm>[];
    public _serverFarms: DropDownElement<ServerFarm>[];
    public selectedSubscription: Subscription;
    public selectedServerFarm: ServerFarm;
    public functionTemplates: FunctionTemplate[];
    public selectedFunction: FunctionInfo;
    public deleteSelectedFunction: boolean;
    public addedFunction: FunctionInfo;
    public noContainerFound: boolean;
    public subscriptionPickerPlaceholder: string;
    public serverFarmPickerPlaceholder: string;
    public region: string;
    private initializing: boolean;

    constructor(private _functionsService: FunctionsService) {
        this.noContainerFound = false;
        this.subscriptionPickerPlaceholder = 'Select Subscription';
        this.serverFarmPickerPlaceholder = 'Select Server Farm (optional)';
        this.region = 'West US';
    }

    ngOnInit() {
        this.initializing = true;
        this._functionsService.initializeUser()
            .subscribe(r => {
                if (!r) {
                    // No Container. Ask the user to pick.
                    //get a list of subs and ask the user to chose.
                    this.initializing = false;
                    this.noContainerFound = true;
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
                } else {
                    this.initFunctions();
                }
            });
    }

    initFunctions() {
        this.noContainerFound = false;
        this._functionsService.getFunctions()
            .subscribe(res => {
                res.unshift(this._functionsService.getNewFunctionNode());
                res.unshift(this._functionsService.getSettingsNode());
                this.functionsInfo = res;
                this.initializing = false;
            });
        this._functionsService.getTemplates()
            .subscribe(res => this.functionTemplates = res);
        this._functionsService.warmupMainSite();
    }

    onFunctionAdded(fi: FunctionInfo) {
        this.addedFunction = fi;
    }

    onFunctionSelect(functionInfo: FunctionInfo){
        this.selectedFunction = functionInfo;
    }

    onDeleteSelectedFunction(deleteSelectedFunction: boolean) {
        this.deleteSelectedFunction = deleteSelectedFunction;
        if (deleteSelectedFunction) {
            this.selectedFunction = null;
        }
    }

    createFunctionsContainer() {
        this.initializing = true;
        var serverFarmId = this.selectedServerFarm ? this.selectedServerFarm.armId : null;
        this._functionsService.createFunctionsContainer(this.selectedSubscription.subscriptionId, this.region, serverFarmId)
            .subscribe(r => this.initFunctions());
    }

    onSubscriptionSelect(value: Subscription) {
        this.selectedSubscription = value;
        delete this.selectedServerFarm;
        this._serverFarms = this.serverFarms.filter(e => e.value.subscriptionId.toLocaleLowerCase() === value.subscriptionId && e.value.geoRegion.toLocaleLowerCase() === this.region.toLocaleLowerCase());
    }

    onGeoRegionChange() {
        delete this.selectedServerFarm;
        this._serverFarms = this.serverFarms.filter(e => e.value.subscriptionId.toLocaleLowerCase() === this.selectedSubscription.subscriptionId && e.value.geoRegion.toLocaleLowerCase() === this.region.toLocaleLowerCase());
    }

}