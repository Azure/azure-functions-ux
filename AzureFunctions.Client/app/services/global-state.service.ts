import {Injectable} from '@angular/core';
import {FunctionContainer} from '../models/function-container';
import {UserService} from './user.service';
import {ArmService} from './arm.service';
import {Constants} from '../models/constants';
import {BusyStateComponent} from '../components/busy-state.component';

@Injectable()
export class GlobalStateService {
    private _functionContainer: FunctionContainer;
    private _appSettings: {[key: string]: string};
    private _globalBusyStateComponent: BusyStateComponent;
    private _shouldBeBusy: boolean;


    constructor(private _userService: UserService, private _armService: ArmService) {
        this._appSettings = {};
        this._userService.getFunctionContainer()
            .subscribe(fc => this._functionContainer = fc)
            .add(() => this._armService.getFunctionContainerAppSettings(this._functionContainer)
                        .subscribe(a => this._appSettings = a));
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
        return this._appSettings[Constants.extensionVersionAppSettingName];
    }

    set AppSettings(value: {[key: string]: string}) {
        if (value) {
            this._appSettings = value;
        }
    }

    set GlobalBusyStateComponent(busyStateComponent: BusyStateComponent) {
        this._globalBusyStateComponent = busyStateComponent;
        setTimeout(() => {
            if (this._shouldBeBusy) {
                this._globalBusyStateComponent.setBusyState();
            }
        });
    }

    setBusyState() {
        if (this._globalBusyStateComponent) {
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
}