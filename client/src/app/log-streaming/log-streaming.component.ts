import { BroadcastService } from './../shared/services/broadcast.service';
import { Component, OnDestroy, Input, Inject, ElementRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { FunctionInfo } from '../shared/models/function-info';
import { UserService } from '../shared/services/user.service';
import { UtilitiesService } from '../shared/services/utilities.service';
import { AccessibilityHelper } from '../shared/Utilities/accessibility-helper';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { ArmUtil } from '../shared/Utilities/arm-utils';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BroadcastEvent } from '../shared/models/broadcast-event';

@Component({
    selector: 'log-streaming',
    templateUrl: './log-streaming.component.html',
    styleUrls: ['./log-streaming.component.scss', '../function-dev/function-dev.component.scss']
})
export class LogStreamingComponent extends FunctionAppContextComponent implements OnDestroy {
    public log: string;
    public stopped: boolean;
    public timerInterval = 1000;
    public isExpanded = false;

    private xhReq: XMLHttpRequest;
    private timeouts: number[];
    private oldLength = 0;
    private token: string;
    private tokenSubscription: Subscription;
    private skipLengthStreaming = 0;
    private skipLengthPolling = 0;
    private fullPollingLog = '';
    private functionInfo: FunctionInfo;
    private pollingActive$: Subject<number>;

    @Input() isHttpLogs: boolean;
    @Output() closeClicked = new EventEmitter<any>();
    @Output() expandClicked = new EventEmitter<boolean>();

    constructor(
        @Inject(ElementRef) private _elementRef: ElementRef,
        private _userService: UserService,
        private _functionAppService: FunctionAppService,
        private _utilities: UtilitiesService,
        broadcastService: BroadcastService) {
        super('log-streaming', _functionAppService, broadcastService);
        this.tokenSubscription = this._userService.getStartupInfo().subscribe(s => this.token = s.token);
        this.log = '';
        this.timeouts = [];
    }

    setup(): Subscription {
        return this.viewInfoEvents
            .subscribe(view => {
                this.functionInfo = view.functionInfo.result;
                // clear logs on navigation to a new viewInfo
                this.log = '';

                this.initLogs(this.isHttpLogs);
                this.startLogs();

                // On function code change
                this._broadcastService.getEvents<void>(BroadcastEvent.FunctionCodeUpdate)
                    // or run clicked
                    .merge(this._broadcastService.getEvents(BroadcastEvent.FunctionRunEvent))
                    // Until there is a new viewInfo (skipping current one) or ngUnsubscribe
                    .takeUntil(this.viewInfoEvents.skip(1).merge(this.ngUnsubscribe))
                    // If the app is dynamic linux
                    .filter(() => ArmUtil.isLinuxDynamic(view.context.site))
                    // start polling logs
                    .subscribe(() => this.startPollingRequest());
            });
    }

    ngOnDestroy() {
        if (this.xhReq) {
            this.timeouts.forEach(window.clearTimeout);
            this.timeouts = [];
            this.xhReq.abort();
        }
        if (this.tokenSubscription) {
            this.tokenSubscription.unsubscribe();
            delete this.tokenSubscription;
        }
        if (this.pollingActive$) {
            this.pollingActive$.next();
            this.pollingActive$.complete();
            this.pollingActive$ = null;
        }
        super.ngOnDestroy();
    }

    startLogs() {
        this.stopped = false;
    }

    stopLogs() {
        this.stopped = true;
    }

    clearLogs() {
        this.skipLengthStreaming = this.skipLengthStreaming + this.log.length;
        this.skipLengthPolling = this.fullPollingLog.length;
        this.log = ' ';
    }

    copyLogs() {
        this._utilities.copyContentToClipboard(this.log);
    }

    handleKeyPress(e: KeyboardEvent) {
        if ((e.which === 65 || e.keyCode === 65) && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this._utilities.highlightText(this._elementRef.nativeElement.querySelector('pre'));
        }
    }

    close() {
        this.closeClicked.emit(null);
    }

    expand() {
        this.isExpanded = true;
        this.expandClicked.emit(true);
    }

    compress() {
        this.isExpanded = false;
        this.expandClicked.emit(false);
    }

    keyDown(KeyboardEvent: any, command: string) {
        if (AccessibilityHelper.isEnterOrSpace(event)) {
            switch (command) {
                case 'startLogs':
                    this.startLogs();
                    break;
                case 'stopLogs':
                    this.stopLogs();
                    break;
                case 'clearLogs':
                    this.clearLogs();
                    break;
                case 'copyLogs':
                    this.copyLogs();
                    break;
                case 'expand':
                    this.expand();
                    break;
                case 'compress':
                    this.compress();
                    break;
                case 'close':
                    this.close();
                    break;
            }
        }
    }

    private initLogs(createEmpty: boolean = true, log?: string) {
        // Dynamic linux apps don't have a streaming log endpoint
        // so we have to poll the logs instead
        if (ArmUtil.isLinuxDynamic(this.context.site)) {
            this.startPollingRequest();
        } else {
            this.startStreamingRequest(createEmpty, log);
        }
    }

    private startPollingRequest() {
        if (this.pollingActive$) {
            // if this variable is present, emit a value
            // this will cancel any ongoing polling
            this.pollingActive$.next();
        } else {
            // otherwise create a new subject
            this.pollingActive$ = new Subject();
        }

        let ongoingRequest = false;
        // Every 2 seconds starting now
        Observable.timer(1, 2000)
            // if logging isn't stopped, and there are no ongoing requests
            // this is done because the getLogs call can be slow due to worker issues
            // in that case if it always takes longer than 2 seconds, we will never catch up to the timer
            .filter(() => !this.stopped && !ongoingRequest)
            // and until this.pollingActive OR 5 minutes have passed, which ever comes first
            .takeUntil(this.pollingActive$.merge(Observable.timer(5 * 60 * 1000)))
            // set ongoing request flag
            .do(() => ongoingRequest = true)
            // Get the latest logs, passing force=true and no range (get all the file)
            .concatMap(() => this._functionAppService.getLogs(this.context, this.functionInfo, null, true))
            // clear ongoing request flag
            .do(() => ongoingRequest = false)
            // and only if it was successful
            .filter(r => !!(r.isSuccessful && r.result))
            // update the displayed logs
            .subscribe(t => this._updatePollingLogs(t.result));
    }

    private startStreamingRequest(createEmpty: boolean = true, log?: string) {
        const maxCharactersInLog = 500000;
        const intervalIncreaseThreshold = 1000;
        const defaultInterval = 1000;
        const maxInterval = 10000;
        let oldLogs = '';

        const promise = new Promise<string>(resolve => {

            if (this.xhReq) {
                this.timeouts.forEach(window.clearTimeout);
                this.timeouts = [];
                this.log = '';
                this.xhReq.abort();
                this.oldLength = 0;
                if (createEmpty && log) {
                    this.log = oldLogs = log;
                    this.oldLength = oldLogs.length;
                    this.skipLengthStreaming = 0;
                }
            }

            const scmUrl = this.context.scmUrl;

            this.xhReq = new XMLHttpRequest();
            const url = `${scmUrl}/api/logstream/application/functions/function/${this.functionInfo.name}`;

            this.xhReq.open('GET', url, true);
            if (this._functionAppService._tryFunctionsBasicAuthToken) {
                // TODO: [ahmels] Fix token
                this.xhReq.setRequestHeader('Authorization', `Basic ${this._functionAppService._tryFunctionsBasicAuthToken}`);
            } else {
                this.xhReq.setRequestHeader('Authorization', `Bearer ${this.token}`);
            }
            this.xhReq.setRequestHeader('FunctionsPortal', '1');
            this.xhReq.send(null);
            if (!createEmpty) {
                // Get the last 10 kb of the latest log file to prepend it to the streaming logs.
                // This is so that when you switch between functions, you can see some of the last logs
                // The ask for this was for users who have functions invoking each other in a chain
                // and wanting to see the logs for the last invocation for a function when switching to it.
                this._functionAppService.getLogs(this.context, this.functionInfo, 10000).subscribe(r => oldLogs = r.result);
            }

            const callBack = () => {
                const diff = this.xhReq.responseText.length + oldLogs.length - this.oldLength;
                if (!this.stopped && diff > 0) {
                    resolve(null);
                    if (this.xhReq.responseText.length > maxCharactersInLog) {
                        this.log = this.xhReq.responseText.substring(this.xhReq.responseText.length - maxCharactersInLog);
                    } else {
                        this.log = oldLogs
                            ? oldLogs + this.xhReq.responseText.substring(this.xhReq.responseText.indexOf('\n') + 1)
                            : this.xhReq.responseText;
                        if (this.skipLengthStreaming > 0) {
                            this.log = this.log.substring(this.skipLengthStreaming);
                        }
                    }

                    this.oldLength = this.xhReq.responseText.length + oldLogs.length;
                    window.setTimeout(() => {
                        const el = document.getElementById('log-stream');
                        if (el) {
                            el.scrollTop = el.scrollHeight;
                        }
                    });
                    const nextInterval = diff - oldLogs.length > intervalIncreaseThreshold ? this.timerInterval + defaultInterval : this.timerInterval - defaultInterval;
                    if (nextInterval < defaultInterval) {
                        this.timerInterval = defaultInterval;
                    } else if (nextInterval > maxInterval) {
                        this.timerInterval = defaultInterval;
                    } else {
                        this.timerInterval = nextInterval;
                    }
                } else if (diff === 0) {
                    this.timerInterval = defaultInterval;
                }
                if (this.xhReq.readyState === XMLHttpRequest.DONE) {
                    this.initLogs(true, this.log);
                } else {
                    this.timeouts.push(window.setTimeout(callBack, this.timerInterval));
                }
            };
            callBack();

        });

        return promise;
    }

    /**
     * This function takes in a string representing the current logs content
     * and should update the displayed log {this.log} with the value.
     * It checks if we are over the limit of displayed characters {maxCharactersInLog}
     * Logs can get really large and it can impact the browser perf if this variable {this.log}
     * grows un-checked
     * @param newLogs string to use to update the update the displayed logs with
     */
    private _updatePollingLogs(newLogs: string) {
        const maxCharactersInLog = 500000;
        this.fullPollingLog = newLogs;

        if (this.skipLengthPolling > 0 && this.skipLengthPolling <= newLogs.length) {
            newLogs = newLogs.substring(this.skipLengthPolling);
        } else if (this.skipLengthPolling > newLogs.length) {
            // in case of polling, we can start polling a new file without knowing.
            // if that's the case, the new log will be less that skip value.
            // reset skip value here.
            this.skipLengthPolling = 0;
        }

        if (newLogs.length > maxCharactersInLog) {
            newLogs = newLogs.substring(newLogs.length - maxCharactersInLog);
        }

        if (this.log !== newLogs) {
            this.log = newLogs;

            // if we just updated the logs, make sure to scroll down to the latest.
            window.setTimeout(() => {
                const el = document.getElementById('log-stream');
                if (el) {
                    el.scrollTop = el.scrollHeight;
                }
            });
        }
    }
}
