import {Injectable, ApplicationRef} from '@angular/core';
import {Http, Headers} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/observable/timer';
import { TranslateService } from '@ngx-translate/core';

import { FunctionContainer } from './../models/function-container';
import { PortalResources } from './../models/portal-resources';
import {UserService} from './user.service';
import {FunctionsService} from './functions.service';
import {BroadcastService} from '../services/broadcast.service';
import { BroadcastEvent } from '../models/broadcast-event';
import { ErrorEvent, ErrorType } from '../models/error-event';
import {Constants} from '../models/constants';
import { ErrorIds } from '../models/error-ids';
import {GlobalStateService} from './global-state.service';
import {ArmService} from './arm.service';
import { AiService } from './ai.service';

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
                setInterval(() => this._applicationRef.tick(), 1000);
            }
    }

    runNonIFrameTasks() {
        if (this._preIFrameTasks && this._preIFrameTasks.closed) {
            this._preIFrameTasks.unsubscribe();
        }

        if (!this._globalStateService.showTryView) {
            this._preIFrameTasks = Observable.timer(1, 60000)
                .concatMap(() => this._userService.getAndUpdateToken().retry(5))
                .subscribe(() => {});
        }
    }

    private isIE(): boolean {
        return navigator.userAgent.toLocaleLowerCase().indexOf('trident') !== -1;
    }
}
