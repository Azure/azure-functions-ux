import { Injectable, ApplicationRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/observable/timer';

import { UserService } from './user.service';
import { GlobalStateService } from './global-state.service';

@Injectable()
export class BackgroundTasksService {

    private _preIFrameTasks: RxSubscription;
    constructor(private _userService: UserService,
        private _globalStateService: GlobalStateService,
        private _applicationRef: ApplicationRef) {
        // background tasks should not be run for a tabbed function
        // it recieves token updates from the parent window
        if (!this._userService.inIFrame && !this._userService.inTab) {
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
                .subscribe(() => { });
        }
    }

    private isIE(): boolean {
        return navigator.userAgent.toLocaleLowerCase().indexOf('trident') !== -1;
    }
}
