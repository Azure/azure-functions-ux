import { Component, OnDestroy, OnChanges, Input, Inject, ElementRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { FunctionInfo } from '../shared/models/function-info';
import { UserService } from '../shared/services/user.service';
import { UtilitiesService } from '../shared/services/utilities.service';
import { AccessibilityHelper } from '../shared/Utilities/accessibility-helper';

@Component({
    selector: 'log-streaming',
    templateUrl: './log-streaming.component.html',
    styleUrls: ['./log-streaming.component.scss', '../function-dev/function-dev.component.scss']
})
export class LogStreamingComponent implements OnDestroy, OnChanges {
    public log: string;
    public stopped: boolean;
    public timerInterval = 1000;
    public isExpanded = false;

    private xhReq: XMLHttpRequest;
    private timeouts: number[];
    private oldLength = 0;
    private token: string;
    private tokenSubscription: Subscription;
    private skipLength = 0;
    @Input() functionInfo: FunctionInfo;
    @Input() isHttpLogs: boolean;
    @Output() closeClicked = new EventEmitter<any>();
    @Output() expandClicked = new EventEmitter<boolean>();

    constructor(
        @Inject(ElementRef) private _elementRef: ElementRef,
        private _userService: UserService,
        private _utilities: UtilitiesService) {
        this.tokenSubscription = this._userService.getStartupInfo().subscribe(s => this.token = s.token);
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

    copyLogs() {
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
                    this.skipLength = 0;
                }
            }

            const scmUrl = this.functionInfo.functionApp.getScmUrl();

            this.xhReq = new XMLHttpRequest();
            const url = `${scmUrl}/api/logstream/application/functions/function/${this.functionInfo.name}`;

            this.xhReq.open('GET', url, true);
            if (this.functionInfo.functionApp.tryFunctionsScmCreds) {
                this.xhReq.setRequestHeader('Authorization', `Basic ${this.functionInfo.functionApp.tryFunctionsScmCreds}`);
            } else {
                this.xhReq.setRequestHeader('Authorization', `Bearer ${this.token}`);
            }
            this.xhReq.setRequestHeader('FunctionsPortal', '1');
            this.xhReq.send(null);
            if (!createEmpty) {
                this.functionInfo.functionApp.getOldLogs(this.functionInfo, 10000).subscribe(r => oldLogs = r);
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
                        if (this.skipLength > 0) {
                            this.log = this.log.substring(this.skipLength);
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
}
