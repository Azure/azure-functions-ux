import {Component, OnDestroy, OnChanges, Input, Inject, ElementRef, Output, EventEmitter} from '@angular/core';
import {FunctionInfo} from '../shared/models/function-info';
import {UserService} from '../shared/services/user.service';
import {FunctionContainer} from '../shared/models/function-container';
import {FunctionsService} from '../shared/services/functions.service';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {ErrorEvent} from '../shared/models/error-event';
import {UtilitiesService} from '../shared/services/utilities.service';
import {Subscription} from 'Rxjs/rx';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {GlobalStateService} from '../shared/services/global-state.service';

@Component({
  selector: 'log-streaming',
  templateUrl: './log-streaming.component.html',
  styleUrls: ['./log-streaming.component.scss', '../function-dev/function-dev.component.scss']
})
export class LogStreamingComponent implements OnDestroy, OnChanges {
    public log: string;
    public stopped: boolean;
    public timerInterval: number = 1000;
    public isExpanded = false;

    private xhReq: XMLHttpRequest;
    private timeouts: number[];
    private oldLength: number = 0;
    private token: string;
    private tokenSubscription: Subscription;
    private skipLength: number = 0;
    @Input() functionInfo: FunctionInfo;
    @Input() isHttpLogs: boolean;
    @Output() closeClicked = new EventEmitter<any>();
    @Output() expandClicked = new EventEmitter<boolean>();

    constructor(
        @Inject(ElementRef) private _elementRef: ElementRef,
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _utilities: UtilitiesService,
        private _globalStateService: GlobalStateService) {
        this.tokenSubscription = this._userService.getToken().subscribe(t => this.token = t);
        this.log = '';
        this.timeouts = [];
    }

    ngOnChanges() {
        this.initLogs(this.isHttpLogs);
        this.startLogs();
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
    }

    startLogs() {
        this.stopped = false;
    }

    stopLogs() {
        this.stopped = true;
    }

    clearLogs() {
        this.skipLength = this.skipLength + this.log.length;
        this.log = ' ';
    }

    copyLogs(event) {
        this._utilities.copyContentToClipboard(this.log);
    }

    handleKeyPress(e: KeyboardEvent) {
        if ((e.which === 65 || e.keyCode == 65) && (e.ctrlKey || e.metaKey)) {
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


    private initLogs(clear?: boolean) {
        const maxCharactersInLog = 500000;
        const intervalIncreaseThreshold = 1000;
        const defaultInterval = 1000;
        const maxInterval = 10000;
        let oldLogs = '';

        var promise = new Promise<string>((resolve, reject) => {

            if (this.xhReq) {
                this.timeouts.forEach(window.clearTimeout);
                this.timeouts = [];
                this.log = '';
                this.xhReq.abort();
                this.oldLength = 0;
            }

            var scmUrl = this.functionInfo.href.substring(0, this.functionInfo.href.indexOf('/api/'));

            this.xhReq = new XMLHttpRequest();
            let url = `${scmUrl}/api/logstream/application/functions/function/${this.functionInfo.name}`;

            this.xhReq.open('GET', url, true);
            if (this._globalStateService.ScmCreds) {
                this.xhReq.setRequestHeader('Authorization', `Basic ${this._globalStateService.ScmCreds}`);
            } else {
                this.xhReq.setRequestHeader('Authorization', `Bearer ${this.token}`);
            }
            this.xhReq.setRequestHeader('FunctionsPortal', '1');
            this.xhReq.send(null);
            if (!clear) {
                this._functionsService.getOldLogs(this.functionInfo, 10000).subscribe(r => oldLogs = r);
            }

            var callBack = () => {
                var diff = this.xhReq.responseText.length + oldLogs.length - this.oldLength;
                if (!this.stopped && diff > 0) {
                    resolve(null);
                    if (this.xhReq.responseText.length > maxCharactersInLog) {
                        this.log = this.xhReq.responseText.substring(this.xhReq.responseText.length - maxCharactersInLog);
                    } else {
                        this.log = oldLogs
                            ? oldLogs + this.xhReq.responseText.substring(this.xhReq.responseText.indexOf('\n') + 1)
                            : this.xhReq.responseText;
                        if (this.skipLength > 0) {
                            this.log = this.log.substring(this.skipLength);
                        }
                    }

                    this.oldLength = this.xhReq.responseText.length + oldLogs.length;
                    window.setTimeout(() => {
                        var el = document.getElementById('log-stream');
                        if (el) {
                            el.scrollTop = el.scrollHeight;
                        }
                    });
                    var nextInterval = diff - oldLogs.length > intervalIncreaseThreshold ? this.timerInterval + defaultInterval : this.timerInterval - defaultInterval;
                    if (nextInterval < defaultInterval) {
                        this.timerInterval = defaultInterval;
                    } else if (nextInterval > maxInterval) {
                        this.timerInterval = defaultInterval;
                    } else {
                        this.timerInterval = nextInterval;
                    }
                } else if (diff == 0) {
                    this.timerInterval = defaultInterval;
                }
                this.timeouts.push(window.setTimeout(callBack, this.timerInterval));
            };
            callBack();

        });

        return promise;
    }
}