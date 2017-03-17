import { TopBarNotification } from './../../top-bar/top-bar-models';
import {Injectable} from '@angular/core';
import {FunctionContainer} from '../models/function-container';
import {ResourceType} from '../models/binding';
import {UserService} from './user.service';
import {ArmService} from './arm.service';
import {Constants} from '../models/constants';
import {BusyStateComponent} from '../../busy-state/busy-state.component';
import {AiService} from './ai.service';
import {LocalDevelopmentInstructionsComponent} from '../../local-development-instructions/local-development-instructions.component';
import {DashboardComponent} from '../../dashboard/dashboard.component';
import {FunctionsService} from './functions.service';
import {Observable, Subscription as RxSubscription, BehaviorSubject, Subject} from 'rxjs/Rx';

@Injectable()
export class GlobalStateService {
    public _functionsService: FunctionsService;
    public showTryView: boolean;
    public isRunningLocal: boolean = false;
    public showTopbar: boolean;
    public isAlwaysOn: boolean = true;
    public enabledApiProxy: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public topBarNotificationsStream = new Subject<TopBarNotification[]>();
    public disabledMessage = new Subject<string>();

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
    private _globalDisabled: boolean = false;


    constructor(private _userService: UserService,
      private _armService: ArmService,
      private _aiService: AiService) {
        this._appSettings = {};
        this.showTryView = window.location.pathname.endsWith('/try');
        this._userService.getStartupInfo().subscribe(info => this._token = info.token);
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

    // The methods below should not be in the globalstate service
    get RoutingExtensionVersion(): string {
        return this._appSettings[Constants.routingExtensionVersionAppSettingName];
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

    get IsBusy(): boolean
    {
        return (this._globalBusyStateComponent && this._globalBusyStateComponent.isBusy) ? true : false;
    }

    setTopBarNotifications(items : TopBarNotification[]){
        this.topBarNotificationsStream.next(items);
    }

    setDisabledMessage(message : string){
        this.disabledMessage.next(message);
    }

    get CurrentToken(): string {
        return this._token;
    }

    get TryAppServiceScmCreds(): string {
        return this._scmCreds;
    }

    set TryAppServiceScmCreds(scmCreds: string) {
        this._scmCreds = scmCreds;
    }

   get TryAppServiceToken(): string {
        return this._tryAppServicetoken;
    }

   set TryAppServiceToken(tryAppServiceToken : string) {
       this._tryAppServicetoken = tryAppServiceToken ;
   }

   get GlobalDisabled(): boolean {
       return this._globalDisabled;
   }

   set GlobalDisabled(value: boolean) {
       this._globalDisabled = value;
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