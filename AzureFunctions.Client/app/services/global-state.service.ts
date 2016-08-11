import {Injectable} from '@angular/core';
import {FunctionContainer} from '../models/function-container';
import {ResourceType} from '../models/binding';
import {UserService} from './user.service';
import {ArmService} from './arm.service';
import {Constants} from '../models/constants';
import {BusyStateComponent} from '../components/busy-state.component';

@Injectable()
export class GlobalStateService {
    private _functionContainer: FunctionContainer;
    private _appSettings: { [key: string]: string };
    private _globalBusyStateComponent: BusyStateComponent;
    private _shouldBeBusy: boolean;
    private _token: string;
    private _tryAppServicetoken: string;
    private _scmCreds: string;

    constructor(private _userService: UserService, private _armService: ArmService) {
        this._appSettings = {};
        this._userService.getFunctionContainer()
            .subscribe(fc => this._functionContainer = fc)
            .add(() => this._armService.getFunctionContainerAppSettings(this._functionContainer)
                .subscribe(a => this._appSettings = a));
        this._userService.getToken().subscribe(t => this._token = t);
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

    get IsLatest(): boolean {
        return this.ExtensionVersion ? Constants.latestExtensionVersion === this.ExtensionVersion || Constants.latest === this.ExtensionVersion.toLowerCase() : false;
    }

    set AppSettings(value: { [key: string]: string }) {
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

    get CurrentToken(): string {
        return this._token;
    }

    get showTryView(): boolean {
        return window.location.pathname.endsWith('/try');
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

   set TryAppServiceToken(tryAppServiceToken : string) {
       this._tryAppServicetoken = tryAppServiceToken ;
   }

   getResourceAppSettings(type: ResourceType): string[] {
       var result = [];
       switch (type) {
           case ResourceType.Storage:
               for (var key in this._appSettings) {
                   var value = this._appSettings[key].toLowerCase();
                   if (value.indexOf("accountname") > -1 && value.indexOf("accountkey") > -1 ) {
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
}