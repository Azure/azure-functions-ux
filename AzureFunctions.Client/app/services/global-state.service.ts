import {Injectable} from '@angular/core';
import {FunctionContainer} from '../models/function-container';
import {ResourceType} from '../models/binding';
import {UserService} from './user.service';
import {ArmService} from './arm.service';
import {Constants} from '../models/constants';
import {BusyStateComponent} from '../components/busy-state.component';
import {AiService} from './ai.service';
import {LocalDevelopmentInstructionsComponent} from '../components/local-development-instructions.component';
import {DashboardComponent} from '../components/dashboard.component';
import {FunctionsService} from './functions.service';
import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';

@Injectable()
export class GlobalStateService {
    private _functionContainer: FunctionContainer;
    private _appSettings: { [key: string]: string };
    private _globalBusyStateComponent: BusyStateComponent;
    private _localDevelopmentInstructions: LocalDevelopmentInstructionsComponent;
    private _dashboardComponent: DashboardComponent;
    private _shouldBeBusy: boolean;
    private _token: string;
    private _tryAppServicetoken: string;
    private _scmCreds: string;
    private _localMode: boolean = false;
    public _functionsService: FunctionsService;

    public showTryView: boolean;
    public isRunningLocal: boolean = false;

    constructor(private _userService: UserService,
      private _armService: ArmService,
      private _aiService: AiService) {
        this._appSettings = {};
        this.showTryView = window.location.pathname.endsWith('/try');
        this._userService.getFunctionContainer()
            .subscribe(fc => {
              this._functionContainer = fc;
              if (!this.showTryView) {
                  this._armService.getFunctionContainerAppSettings(this._functionContainer)
                      .subscribe(a => this._appSettings = a);
              }
            });
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
        return this._appSettings[Constants.runtimeVersionAppSettingName];
    }

    get IsLatest(): boolean {
        return this.showTryView || (this.ExtensionVersion ? Constants.runtimeVersion === this.ExtensionVersion || Constants.latest === this.ExtensionVersion.toLowerCase() : false);
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

    get IsBusy(): boolean
    {
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

   set TryAppServiceToken(tryAppServiceToken : string) {
       this._tryAppServicetoken = tryAppServiceToken ;
   }

   getAccountNameAndKeyFromAppSetting(settingName: string): string {
            var value = this._appSettings[settingName].toLowerCase();
            var accountName = 'invalid';
            var accountKey = 'invalid';
                var partsArray = value.split(';');
                for (var i = 0; i < partsArray.length; i++) {
                    var part = partsArray[i];
                    var accountNameIndex = part.toLowerCase().indexOf("accountname");
                    var accountKeyIndex = part.toLowerCase().indexOf("accountkey");
                    if (accountNameIndex > -1)
                        accountName = part.substring(accountNameIndex + 12, part.length);
                    if (accountKeyIndex > -1)
                        accountKey = part.substring(accountKeyIndex + 11, part.length);
                }
                return accountName + "," +accountKey;
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

   showLocalDevelopInstructions() {
       this._localDevelopmentInstructions.show();
   }

   set LocalDevelopmentInstructionsComponent(value: LocalDevelopmentInstructionsComponent) {
       this._localDevelopmentInstructions = value;
   }

   set DashboardComponent(value: DashboardComponent) {
       this._dashboardComponent = value;
   }

   checkLocalFunctionsServer() {
       return this._functionsService.checkLocalFunctionsServer();
   }

   switchToLocalServer() {
       this.isRunningLocal = true;
       this._functionsService.switchToLocalServer();
       this._dashboardComponent.onRefreshClicked();
   }

   switchToAzure() {
       this.isRunningLocal = false;
       this._functionsService.switchToAzure();
       this._dashboardComponent.onRefreshClicked();
   }
}