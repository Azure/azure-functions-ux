import { FunctionContainer } from './../models/function-container';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { PortalResources } from './../models/portal-resources';
import {Injectable, ApplicationRef} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {UserService} from './user.service';
import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';
import {FunctionsService} from './functions.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import { ErrorEvent, ErrorType } from '../models/error-event';
import {Constants} from '../models/constants';
import {GlobalStateService} from './global-state.service';
import {ArmService} from './arm.service';
import { AiService } from './ai.service';
import { ErrorIds } from "../models/error-ids";

@Injectable()
export class BackgroundTasksService {

    private _preIFrameTasks: RxSubscription;
    private _tasks: RxSubscription;
    private _isResourcesReceived = false;
    constructor(private _http: Http,
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _armService: ArmService,
        private _aiService: AiService,
        private _applicationRef: ApplicationRef,
        private _translateService: TranslateService) {
        if (!this._userService.inIFrame) {
            this.runPreIFrameTasks();
        }
        if (this.isIE()) {
            console.log('Detected IE, running zone.js workaround');
            setInterval(() => this._applicationRef.tick(), 1000)
        }
    }

    runPreIFrameTasks() {
        if (this._preIFrameTasks && this._preIFrameTasks.closed) {
            this._preIFrameTasks.unsubscribe();
        }

        if (!this._globalStateService.showTryView) {
            this._preIFrameTasks = Observable.timer(1, 60000)
                .concatMap<string>(() => this._http.get(Constants.serviceHost + 'api/token?plaintext=true').retry(5).map<string>(r => r.text()))
                .subscribe(t => this._userService.setToken(t));
        }
    }

    runTasks() {
        if (this._tasks && !this._tasks.closed) {
            this._tasks.unsubscribe();
            delete this._tasks;
        }

        if (!this._globalStateService.showTryView && !this._globalStateService.GlobalDisabled) {
            let tasks = () => Observable.zip(
                this._functionsService.getHostErrors().catch(e => Observable.of([])),
                this._armService.getConfig(this._globalStateService.FunctionContainer),
                this._armService.getFunctionContainerAppSettings(this._globalStateService.FunctionContainer),
                this._armService.getAuthSettings(this._globalStateService.FunctionContainer),
                this._armService.getFunctionContainer(this._globalStateService.FunctionContainer.id),
                (e, c, a, auth, fc) => ({ errors: e, config: c, appSettings: a, authSettings: auth, functionContainer: fc }));
            let handleResult = result => {

                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.generalHostErrorFromHost);
                // Give clearing a chance to run
                setTimeout(() => {
                    result.errors.forEach(e => {
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: this._translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
                            details: this._translateService.instant(PortalResources.functionDev_hostErrorMessage, { error: e }),
                            errorId: ErrorIds.generalHostErrorFromHost,
                            errorType: ErrorType.RuntimeError
                        });
                        this._aiService.trackEvent('/errors/host', { error: e, app: this._globalStateService.FunctionContainer.id });
                    });
                });

                this.setDisabled(result.config);
                this._globalStateService.isAlwaysOn = result.config["alwaysOn"] === true ||
                    (this._globalStateService.FunctionContainer.properties && this._globalStateService.FunctionContainer.properties.sku === "Dynamic") ? true : false;
                this._functionsService.setEasyAuth(result.authSettings);
                this._globalStateService.AppSettings = result.appSettings;
                if (!this._isResourcesReceived) {
                    this._functionsService.getResources().subscribe(() => {
                        this._isResourcesReceived = true;
                    });
                }
                this._broadcastService.broadcast(BroadcastEvent.VersionUpdated);
                if (!result.functionContainer.properties.enabled || result.functionContainer.properties.state === 'Stopped') {
                    let error = result.functionContainer.properties.siteDisabledReason === 1
                        ? PortalResources.error_FunctionExceededQuota
                        : PortalResources.error_siteStopped;

                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(error),
                        errorId: ErrorIds.functionAppStopped,
                        errorType: ErrorType.Fatal
                    });
                }
            };
            this._tasks = Observable.timer(1, 60000)
                .concatMap<{ errors: string[], config: { [key: string]: string }, appSettings: { [key: string]: string }, functionContainer: FunctionContainer }>(() => tasks())
                .subscribe(result => handleResult(result));

            this._broadcastService.subscribe(BroadcastEvent.RefreshPortal, () => {
                tasks().subscribe(r => handleResult(r));
            });
        } else if (this._globalStateService.FunctionContainer.tryScmCred !== null) {
            this._tasks = Observable.timer(1, 60000)
                .concatMap<{ errors: string[], config: { [key: string]: string }, appSettings: { [key: string]: string } }>(() =>
                    Observable.zip(
                        this._functionsService.getHostErrors().catch(e => Observable.of([])),
                        (e) => ({ errors: e })
                    )
                )
                .subscribe(result => {
                    result.errors.forEach(e => this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error,{
                        message: e,
                        details: `Host Error: ${e}`,
                        errorId: ErrorIds.generalHostErrorFromHost,
                        errorType: ErrorType.RuntimeError
                    }));

                });
        }
    }

    private setDisabled(config: any) {
        if (!config["scmType"] || config["scmType"] !== "None") {
            this._broadcastService.setDirtyState("function_disabled");
        } else {
            this._broadcastService.clearDirtyState("function_disabled", true);
        }
    }

    private isIE(): boolean {
        return navigator.userAgent.toLocaleLowerCase().indexOf("trident") !== -1;
    }
}