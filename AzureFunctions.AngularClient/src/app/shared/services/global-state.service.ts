import {Injectable} from '@angular/core';
import {FunctionContainer} from '../models/function-container';
import {ResourceType} from '../models/binding';
import {UserService} from './user.service';
import {ArmService} from './arm.service';
import {Constants} from '../models/constants';
import {BusyStateComponent} from '../../busy-state/busy-state.component';
import {AiService} from './ai.service';
import {DashboardComponent} from '../../dashboard/dashboard.component';
import {FunctionsService} from './functions.service';
import {Observable, Subscription as RxSubscription, BehaviorSubject} from 'rxjs/Rx';

@Injectable()
export class GlobalStateService {
    public _functionsService: FunctionsService;
    public showTryView: boolean;
    public showTopbar: boolean;
    public isAlwaysOn: boolean = true;
    public enabledApiProxy: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private _functionContainer: FunctionContainer;
    private _appSettings: { [key: string]: string };
    private _globalBusyStateComponent: BusyStateComponent;
    private _dashboardComponent: DashboardComponent;
    private _shouldBeBusy: boolean;
    private _token: string;
    private _tryAppServicetoken: string;
    private _scmCreds: string;
    private _globalDisabled: boolean = false;

    constructor(private _userService: UserService,
        private _armService: ArmService,
        private _aiService: AiService) {
        this._appSettings = {};
        this.showTryView = window.location.pathname.endsWith('/try');
        this._userService.getFunctionContainer()
            .subscribe(fc => {
                this._functionContainer = fc;
                if (!this.showTryView && !this.GlobalDisabled) {
                    this._armService.getFunctionContainerAppSettings(this._functionContainer)
                        .subscribe(a => this._appSettings = a);
                }
            });
        this._userService.getToken().subscribe(t => this._token = t);

        this.enabledApiProxy.next(false);
    }

    get FunctionContainer(): FunctionContainer {
        return this._functionContainer;
    }

    get DefaultStorageAccount(): string {
        for (var key in this._appSettings) {
            if (key.toString().endsWith('_STORAGE')) {
                return key;
            }
        }
        return '';
    }

    get ExtensionVersion(): string {
        return this._appSettings[Constants.runtimeVersionAppSettingName];
    }

    get RoutingExtensionVersion(): string {
        return this._appSettings[Constants.routingExtensionVersionAppSettingName];
    }

    get IsLatest(): boolean {
        return this.showTryView || (this.ExtensionVersion ? Constants.runtimeVersion === this.ExtensionVersion || Constants.latest === this.ExtensionVersion.toLowerCase() : false);
    }

    get IsLatestRoutingVersion(): boolean {
        return (this.RoutingExtensionVersion ? Constants.routingExtensionVersion === this.RoutingExtensionVersion || Constants.latest === this.RoutingExtensionVersion.toLowerCase() : false);
    }

    get IsRoutingEnabled() {
        return this.RoutingExtensionVersion && this.RoutingExtensionVersion.toLowerCase() !== Constants.disabled;
    }

    set AppSettings(value: { [key: string]: string }) {
        if (value) {
            this._appSettings = value;
        }

        this.enabledApiProxy.next(this.RoutingExtensionVersion && this.RoutingExtensionVersion !== Constants.disabled);
    }

    set GlobalBusyStateComponent(busyStateComponent: BusyStateComponent) {
        this._globalBusyStateComponent = busyStateComponent;
        setTimeout(() => {
            if (this._shouldBeBusy) {
                this._globalBusyStateComponent.setBusyState();
            }
        });
    }

    setBusyState(message?: string) {
        if (this._globalBusyStateComponent) {
            this._globalBusyStateComponent.message = message;
            this._globalBusyStateComponent.setBusyState();
        } else {
            this._shouldBeBusy = true;
        }
    }

    clearBusyState() {
        if (this._globalBusyStateComponent) {
            this._globalBusyStateComponent.clearBusyState();
        } else {
            this._shouldBeBusy = false;
        }
    }

    get IsBusy(): boolean {
        return (this._globalBusyStateComponent && this._globalBusyStateComponent.isBusy) ? true : false;
    }

    get CurrentToken(): string {
        return this._token;
    }

    get ScmCreds(): string {
        return this._scmCreds;
    }

    set ScmCreds(scmCreds: string) {
        this._scmCreds = scmCreds;
    }

    get TryAppServiceToken(): string {
        return this._tryAppServicetoken;
    }

    set TryAppServiceToken(tryAppServiceToken: string) {
        this._tryAppServicetoken = tryAppServiceToken;
    }

    get GlobalDisabled(): boolean {
        return this._globalDisabled;
    }

    set GlobalDisabled(value: boolean) {
        this._globalDisabled = value;
    }

    getAccountNameAndKeyFromAppSetting(settingName: string): string[] {
        var value = this._appSettings[settingName];
        if (value) {
            var account = [];
            var accountName;
            var accountKey;
            var partsArray = value.split(';');
            for (var i = 0; i < partsArray.length; i++) {
                var part = partsArray[i];
                var accountNameIndex = part.toLowerCase().indexOf("accountname");
                var accountKeyIndex = part.toLowerCase().indexOf("accountkey");
                if (accountNameIndex > -1)
                    accountName = (part.substring(accountNameIndex + 12, part.length));
                if (accountKeyIndex > -1)
                    accountKey = (part.substring(accountKeyIndex + 11, part.length));
            }
            account.push(value);
            if (accountKey) account.push(accountKey);
            if (accountName) account.push(accountName);
            return account;
        } else {
            return [];
        }
    }

    getResourceAppSettings(type: ResourceType): string[] {
        var result = [];
        switch (type) {
            case ResourceType.Storage:
                for (var key in this._appSettings) {
                    var value = this._appSettings[key].toLowerCase();
                    if (value.indexOf("accountname") > -1 && value.indexOf("accountkey") > -1) {
                        result.push(key);
                    }
                }
                break;
            case ResourceType.EventHub:
            case ResourceType.ServiceBus:
                for (var key in this._appSettings) {

                    var value = this._appSettings[key].toLowerCase();
                    if (value.indexOf("sb://") > -1 && value.indexOf("sharedaccesskeyname") > -1) {
                        result.push(key);
                    }
                }
                break;
            case ResourceType.ApiHub:
                for (var key in this._appSettings) {
                    var value = this._appSettings[key].toLowerCase();
                    if (value.indexOf("logic-apis") > -1 && value.indexOf("accesstoken") > -1) {
                        result.push(key);
                    }
                }
                break;

            case ResourceType.DocumentDB:
                for (var key in this._appSettings) {
                    var value = this._appSettings[key].toLowerCase();
                    if (value.indexOf("accountendpoint") > -1 && value.indexOf("documents.azure.com") > -1) {
                        result.push(key);
                    }
                }
                break;
        }
        return result;
    }

    set DashboardComponent(value: DashboardComponent) {
        this._dashboardComponent = value;
    }
}
