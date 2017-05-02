import { FunctionContainer } from './../models/function-container';
import { TranslateService } from '@ngx-translate/core';
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
                this.runNonIFrameTasks();
            }
            if (this.isIE()) {
                console.log('Detected IE, running zone.js workaround');
                setInterval(() => this._applicationRef.tick(), 1000)
            }
    }

    runNonIFrameTasks() {
        if (this._preIFrameTasks && this._preIFrameTasks.closed) {
            this._preIFrameTasks.unsubscribe();
        }

        if (!this._globalStateService.showTryView) {
            this._preIFrameTasks = Observable.timer(1, 60000)
                .concatMap(() => this._userService.getToken().retry(5))
                .subscribe(token => {
                });
        }
    }

    private isIE(): boolean {
        return navigator.userAgent.toLocaleLowerCase().indexOf("trident") !== -1;
    }
}
