import { BroadcastService } from './../shared/services/broadcast.service';
import { Component, OnDestroy, Input, Inject, ElementRef, Output, EventEmitter, ViewChild, ViewContainerRef, ComponentFactory, ComponentFactoryResolver, ComponentRef } from '@angular/core';
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
import { LogContentComponent } from './log-content.component';
import { Regex, LogConsoleTypes } from '../shared/models/constants';
import { PortalResources } from '../shared/models/portal-resources';

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
    public popOverTimeout = 500;
    private _isConnectionSuccessful = true;
    private _xhReq: XMLHttpRequest;
    private _timeouts: number[];
    private _oldLength = 0;
    private _token: string;
    private _tokenSubscription: Subscription;
    private _functionInfo: FunctionInfo;
    private _pollingActive$: Subject<number>;
    private _logContentComponent: ComponentFactory<any>;
    private _logStreamIndex = 0;
    private _logComponents: ComponentRef<any>[] = [];

    @Input() isHttpLogs: boolean;
    @Output() closeClicked = new EventEmitter<any>();
    @Output() expandClicked = new EventEmitter<boolean>();
    @ViewChild('logs', {read: ViewContainerRef})
    private _logElement: ViewContainerRef;

    constructor(
        broadcastService: BroadcastService,
        @Inject(ElementRef) private _elementRef: ElementRef,
        private _userService: UserService,
        private _functionAppService: FunctionAppService,
        private _utilities: UtilitiesService,
        private _componentFactoryResolver: ComponentFactoryResolver) {
        super('log-streaming', _functionAppService, broadcastService);
        this._tokenSubscription = this._userService.getStartupInfo().subscribe(s => this._token = s.token);
        this.log = '';
        this._timeouts = [];
    }

    setup(): Subscription {
        return this.viewInfoEvents
            .subscribe(view => {
                this._functionInfo = view.functionInfo.result;
                // clear logs on navigation to a new viewInfo
                this.log = '';
                this._logContentComponent = this._componentFactoryResolver.resolveComponentFactory(LogContentComponent);
                this._initLogs(this.isHttpLogs);
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
                    .subscribe(() => this._startPollingRequest());
            });
    }

    ngOnDestroy() {
        if (this._xhReq) {
            this._timeouts.forEach(window.clearTimeout);
            this._timeouts = [];
            this._xhReq.abort();
        }
        if (this._tokenSubscription) {
            this._tokenSubscription.unsubscribe();
            delete this._tokenSubscription;
        }
        if (this._pollingActive$) {
            this._pollingActive$.next();
            this._pollingActive$.complete();
            this._pollingActive$ = null;
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
        this.log = '';
        for (let i = this._logComponents.length; i > 0; --i) {
            this._logComponents.pop().destroy();
        }
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

    reconnect() {
        this._isConnectionSuccessful = false;
        if (this.canReconnect()) {
            this._isConnectionSuccessful = true;
            this._oldLength = 0;
            this._initLogs(this.isHttpLogs);
        }
    }

    canReconnect(): boolean {
        if (this._xhReq) {
            return this._xhReq.readyState === XMLHttpRequest.DONE;
        }
        return true;
    }

    getPopoverText(): string {
        if (this._isConnectionSuccessful) {
            return PortalResources.logStreaming_reconnectSuccess;
        }
        return PortalResources.logStreaming_connectionExists;
    }

    private _initLogs(createEmpty: boolean = true, log?: string) {
        // Dynamic linux apps don't have a streaming log endpoint
        // so we have to poll the logs instead
        if (ArmUtil.isLinuxDynamic(this.context.site)) {
            this._startPollingRequest();
        } else {
            this._startStreamingRequest(createEmpty, log);
        }
    }

    private _startPollingRequest() {
        if (this._pollingActive$) {
            // if this variable is present, emit a value
            // this will cancel any ongoing polling
            this._pollingActive$.next();
        } else {
            // otherwise create a new subject
            this._pollingActive$ = new Subject();
        }

        let ongoingRequest = false;
        // Every 2 seconds starting now
        Observable.timer(1, 2000)
            // if logging isn't stopped, and there are no ongoing requests
            // this is done because the getLogs call can be slow due to worker issues
            // in that case if it always takes longer than 2 seconds, we will never catch up to the timer
            .filter(() => !this.stopped && !ongoingRequest)
            // and until this.pollingActive OR 5 minutes have passed, which ever comes first
            .takeUntil(this._pollingActive$.merge(Observable.timer(5 * 60 * 1000)))
            // set ongoing request flag
            .do(() => ongoingRequest = true)
            // Get the latest logs, passing force=true and no range (get all the file)
            .concatMap(() => this._functionAppService.getLogs(this.context, this._functionInfo, null, true))
            // clear ongoing request flag
            .do(() => ongoingRequest = false)
            // and only if it was successful
            .filter(r => !!(r.isSuccessful && r.result))
            // update the displayed logs
            .subscribe(t => this._updatePollingLogs(t.result));
    }

    private _startStreamingRequest(createEmpty: boolean = true, log?: string) {
        const intervalIncreaseThreshold = 1000;
        const defaultInterval = 1000;
        const maxInterval = 10000;
        let oldLogs = '';
        const promise = new Promise<string>(resolve => {

            if (this._xhReq) {
                this._timeouts.forEach(window.clearTimeout);
                this._timeouts = [];
                this.log = '';
                this._xhReq.abort();
                this._oldLength = 0;
                if (createEmpty && log) {
                    this.log = oldLogs = log;
                    this._oldLength = oldLogs.length;
                }
            }
            const scmUrl = this.context.scmUrl;
            this._xhReq = new XMLHttpRequest();
            const url = `${scmUrl}/api/logstream/application/functions/function/${this._functionInfo.name}`;
            this._xhReq.open('GET', url, true);
            if (this._functionAppService._tryFunctionsBasicAuthToken) {
                // TODO: [ahmels] Fix token
                this._xhReq.setRequestHeader('Authorization', `Basic ${this._functionAppService._tryFunctionsBasicAuthToken}`);
            } else {
                this._xhReq.setRequestHeader('Authorization', `Bearer ${this._token}`);
            }
            this._xhReq.setRequestHeader('FunctionsPortal', '1');
            this._xhReq.send(null);
            if (!createEmpty) {
                // Get the last 10 kb of the latest log file to prepend it to the streaming logs.
                // This is so that when you switch between functions, you can see some of the last logs
                // The ask for this was for users who have functions invoking each other in a chain
                // and wanting to see the logs for the last invocation for a function when switching to it.
                this._functionAppService.getLogs(this.context, this._functionInfo, 10000).subscribe(r => {
                    oldLogs = r.result;
                    if (!this.stopped) {
                        this._addLogContent(oldLogs, LogConsoleTypes.Normal);
                    }
                });
            }

            const callBack = () => {
                const diff = this._xhReq.responseText.length + oldLogs.length - this._oldLength;
                if (!this.stopped && diff > 0) {
                    resolve(null);
                    let logStream = '';
                    logStream = this._xhReq.responseText.substring(this._xhReq.responseText.indexOf('\n') + 1);
                    if (oldLogs === '' && this._oldLength === 0) {
                        this._addLogContent(this._xhReq.responseText.substring(-1, this._xhReq.responseText.indexOf('\n') + 1), LogConsoleTypes.Normal);
                    }
                    this._processLogs(logStream.substring(this._logStreamIndex));
                    this.log = this._oldLength > 0
                        ? this.log + logStream.substring(this._logStreamIndex)
                        : this._xhReq.responseText;
                    this._logStreamIndex = logStream.length;
                    this._oldLength = this._xhReq.responseText.length + oldLogs.length;
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
                if (this._xhReq.readyState !== XMLHttpRequest.DONE) {
                    this._timeouts.push(window.setTimeout(callBack, this.timerInterval));
                }
            };
            callBack();
        });
        return promise;
    }

    /**
     * This function takes in a string representing the current logs content
     * and should update the displayed log with the value.
     * @param newLogs string to use to update the update the displayed logs with
     */
    private _updatePollingLogs(newLogs: string) {
        if (this._logStreamIndex <= newLogs.length) {
            newLogs = newLogs.substring(this._logStreamIndex);
        } else {
            this._logStreamIndex = 0;
        }
        this.log += newLogs;
        if (this._logStreamIndex < newLogs.length) {
            this._processLogs(newLogs.substring(this._logStreamIndex));
            this._logStreamIndex += newLogs.length;
            // if we just updated the logs, make sure to scroll down to the latest.
            window.setTimeout(() => {
                const el = document.getElementById('log-stream');
                if (el) {
                    el.scrollTop = el.scrollHeight;
                }
            });
        }
    }

    /**
     * This checks if we are over the limit of displayed characters {maxCharactersInLog} and then adds the logs to the console.
     * Logs can get really large and it can impact the browser perf if this variable {this.log}
     * grows un-checked.
     * @param logStream string which contains the logs to be displayed
     */
    private _processLogs(logStream: string) {
        const maxCharactersInLog = 500000;
        if (logStream.length > maxCharactersInLog) {
            logStream = logStream.substring(logStream.length - maxCharactersInLog);
        }
        const logArray = logStream.split('\n');
        let logs = logArray[0];
        let type = this._getLogType(logs);
        for (let i = 1; i < logArray.length - 1; ++i) {
            const currentLogType = this._getLogType(logArray[i]);
            if (currentLogType === -1) {
                logs += '\n' + logArray[i];
            } else {
                this._addLogContent(logs, type);
                logs = logArray[i];
                type = currentLogType;
            }
        }
        this._addLogContent(logs, type);
    }

    /**
     * Get the log type based on the given string
     * @param log string which contains a single log
     */
    private _getLogType(log: string) {
        if (log.match(Regex.errorLog)) {
            return LogConsoleTypes.Error;
        }
        if (log.match(Regex.infoLog)) {
            return LogConsoleTypes.Info;
        }
        if (log.match(Regex.warningLog)) {
            return LogConsoleTypes.Warning;
        }
        if (log.match(Regex.log)) {
            return LogConsoleTypes.Normal;
        }
        return -1;
    }

    /**
     * This function adds the log content to the console giving it a color
     * according to the type specified
     * @param logs string which containts the log
     * @param type represents the particular type of the log
     */
    private _addLogContent(logs: string, type: number) {
        if (type === -1 && this._logComponents.length > 0) {
            this._logComponents[this._logComponents.length - 1].instance.logs += logs;
            return;
        }
        type = (type === -1) ? LogConsoleTypes.Normal : type;
        const component = this._logElement.createComponent(this._logContentComponent);
        component.instance.logs = logs;
        component.instance.type = type;
        this._logComponents.push(component);
    }
}
