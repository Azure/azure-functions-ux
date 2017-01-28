import {Injectable, ApplicationRef} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {UserService} from './user.service';
import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';
import {FunctionsService} from './functions.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {ErrorEvent} from '../models/error-event';
import {Constants} from '../models/constants';
import {GlobalStateService} from './global-state.service';
import {ArmService} from './arm.service';
import {AiService} from './ai.service';

@Injectable()
export class BackgroundTasksService {

    private _preIFrameTasks: RxSubscription;
    private _tasks: RxSubscription;
    // private _isResourcesReceived = false;
    constructor(private _http: Http,
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _armService: ArmService,
        private _aiService: AiService,
        private _applicationRef: ApplicationRef) {
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
        if (!this._globalStateService.showTryView)
        this._preIFrameTasks = Observable.timer(1, 60000)
            .concatMap<string>(() => this._http.get(Constants.serviceHost + 'api/token?plaintext=true').retry(5).map<string>(r => r.text()))
            .subscribe(t => this._userService.setToken(t));
    }

    runTasks() {
        if (this._tasks && !this._tasks.closed) {
            this._tasks.unsubscribe();
            delete this._tasks;
        }

        if (!this._globalStateService.showTryView && !this._globalStateService.GlobalDisabled) {
            // let tasks = () => Observable.zip(
            //             this._functionsService.getHostErrors().catch(e => Observable.of([])),
            //             // this._armService.getConfig(this._globalStateService.FunctionContainer.id),
            //             // this._armService.getAuthSettings(this._globalStateService.FunctionContainer),
            //             (e) => ({ errors: e}));
            // let handleResult = result => {
            //     result.errors.forEach(e => {
            //             this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: e, details: `Host Error: ${e}` });
            //             this._aiService.trackEvent('/errors/host', {error: e, app: this._globalStateService.FunctionContainer.id});
            //         });
                    // this._globalStateService.isAlwaysOn = result.config["alwaysOn"] === true ||
                    //     (this._globalStateService.FunctionContainer.properties && this._globalStateService.FunctionContainer.properties.sku === "Dynamic") ? true : false;

                    // this._functionsService.setEasyAuth(result.authSettings);

                    // if (!this._isResourcesReceived) {
                    //     this._functionsService.getResources().subscribe(() => {
                    //         this._isResourcesReceived = true;
                    //     });
                    // }
                //    this._broadcastService.broadcast(BroadcastEvent.VersionUpdated);
            // };
            // this._tasks = Observable.timer(1, 60000)
            //     .concatMap<{ errors: string[] }>(() => tasks())
            //     .subscribe(result => handleResult(result));

            // this._broadcastService.subscribe(BroadcastEvent.RefreshPortal, () => {
            //     tasks().subscribe(r => handleResult(r));
            // });
        } else if (this._globalStateService.FunctionContainer.tryScmCred !== null) {
            this._tasks = Observable.timer(1, 60000)
                .concatMap<{ errors: string[], config: { [key: string]: string }, appSettings: { [key: string]: string } }>(() =>
                    Observable.zip(
                        this._functionsService.getHostErrors().catch(e => Observable.of([])),
                        (e) => ({ errors: e})
                    )
                )
                .subscribe(result => {
                    result.errors.forEach(e => this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error,
                        { message: e, details: `Host Error: ${e}` }));

                });
        }
    }

    private isIE(): boolean {
        return navigator.userAgent.toLocaleLowerCase().indexOf("trident") !== -1;
    }
}