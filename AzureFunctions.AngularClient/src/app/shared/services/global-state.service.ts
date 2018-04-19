import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { TopBarNotification } from './../../top-bar/top-bar-models';
import { FunctionContainer } from '../models/function-container';
import { UserService } from './user.service';
import { Constants } from '../models/constants';
import { BusyStateComponent } from '../../busy-state/busy-state.component';
import { FunctionsService } from './functions.service';

@Injectable()
export class GlobalStateService {
    public _functionsService: FunctionsService;
    public showTryView: boolean;
    public showTopbar: boolean;
    public isAlwaysOn = true;
    public enabledApiProxy: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public topBarNotificationsStream = new ReplaySubject<TopBarNotification[]>(1);
    public disabledMessage = new Subject<string>();

    private _functionContainer: FunctionContainer;
    private _appSettings: { [key: string]: string };
    private _globalBusyStateComponent: BusyStateComponent;
    private _shouldBeBusy: boolean;
    private _token: string;
    private _tryAppServicetoken: string;
    private _globalDisabled = false;
    private _trialExpired = false;

    constructor(private _userService: UserService) {
        this._appSettings = {};
        this.showTryView = window.location.pathname.toLowerCase().endsWith('/try');
        this._userService.getStartupInfo().subscribe(info => this._token = info.token);
        this.enabledApiProxy.next(false);
    }

    get FunctionContainer(): FunctionContainer {
        return this._functionContainer;
    }

    get DefaultStorageAccount(): string {
        for (let key in this._appSettings) {
            if (key.toString().endsWith('_STORAGE')) {
                return key;
            }
        }
        return '';
    }

    // The methods below should not be in the globalstate service
    get RoutingExtensionVersion(): string {
        return this._appSettings[Constants.routingExtensionVersionAppSettingName];
    }

    get IsRoutingEnabled() {
        return this.RoutingExtensionVersion && this.RoutingExtensionVersion.toLowerCase() !== Constants.disabled;
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

    setTopBarNotifications(items: TopBarNotification[]) {
        this.topBarNotificationsStream.next(items);
    }

    setDisabledMessage(message: string) {
        this.disabledMessage.next(message);
    }

    get CurrentToken(): string {
        return this._token;
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

    set TrialExpired(value: boolean) {
        this._trialExpired = value;
    }
    get TrialExpired(): boolean {
        return this._trialExpired;
    }
}
