import {Component, OnDestroy, OnChanges, Input, Inject, ElementRef} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {UserService} from '../services/user.service';
import {FunctionContainer} from '../models/function-container';
import {FunctionsService} from '../services/functions.service';
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';
import {ErrorEvent} from '../models/error-event';
import {UtilitiesService} from '../services/utilities.service';
import {PopOverComponent} from './pop-over.component';

@Component({
    selector: 'log-streaming',
    templateUrl: 'templates/log-streaming.component.html',
    styleUrls: ['styles/function-dev.style.css'],
    directives: [PopOverComponent]
})
export class LogStreamingComponent implements OnDestroy, OnChanges {
    public log: string;
    public stopped: boolean;
    private hostErrors: string;
    private xhReq: XMLHttpRequest;
    private timeouts: number[];
    public timerInterval: number = 1000;
    private oldLength: number = 0;
    @Input() functionInfo: FunctionInfo;

    constructor(
        @Inject(ElementRef) private _elementRef: ElementRef,
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService,
        private _utilities: UtilitiesService) {
        this.hostErrors = '';
        this.log = '';
        this.timeouts = [];
    }

    ngOnChanges() {
        this.initLogs();
        this.startLogs()
    }

    ngOnDestroy() {
        if (this.xhReq){
            this.timeouts.forEach(window.clearTimeout);
            this.timeouts = [];
            this.xhReq.abort();
        }
    }

    startLogs(){
        this.stopped = false;
    }

    stopLogs(){
        this.stopped = true;
    }

    clearLogs(){
        this.initLogs();
    }

    copyLogs() {
        this._utilities.copyContentToClipboard(this._elementRef.nativeElement.querySelector('pre'));
    }

    handleKeyPress(e: KeyboardEvent) {
        if ((e.which === 65 || e.keyCode == 65) && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this._utilities.highlightText(this._elementRef.nativeElement.querySelector('pre'));
        }
    }

    private initLogs() {
        if (this.xhReq) {
            this.timeouts.forEach(window.clearTimeout);
            this.timeouts = [];
            this.log = '';
            this.xhReq.abort();
            this.oldLength = 0;
        }

        this._functionsService.getFunctionErrors(this.functionInfo)
            .subscribe(
                (r: string[]) => this.hostErrors = r.reduce((a, b) => a + b + '\n', ''),
                error => this._functionsService.getHostErrors()
                             .subscribe(errors => errors.forEach(e => this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {message: e, details: `Host Error: ${e}`}))));

        var scmUrl = this.functionInfo.href.substring(0, this.functionInfo.href.indexOf('/api/'));

        this.xhReq = new XMLHttpRequest();
        this.xhReq.open('GET', `${scmUrl}/api/logstream/application/functions/function/${this.functionInfo.name}`, true);
        this.xhReq.setRequestHeader('Authorization', `Bearer ${this._userService.getCurrentToken()}`);
        this.xhReq.setRequestHeader('FunctionsPortal', '1');
        this.xhReq.send(null);


        var callBack = () => {
            var diff = this.xhReq.responseText.length -  this.oldLength;
            if (!this.stopped && diff > 0) {
                if (this.xhReq.responseText.length > 500000) {
                    this.log = this.xhReq.responseText.substring(this.xhReq.responseText.length - 500000);
                } else {
                    this.log = this.hostErrors + this.xhReq.responseText;
                }
                this.oldLength = this.xhReq.responseText.length;
                window.setTimeout(() => {
                    var el = document.getElementById('log-stream');
                    if (el) {
                        el.scrollTop = el.scrollHeight;
                    }
                });
                var nextInterval = diff > 500 ? this.timerInterval + 1000 : this.timerInterval - 1000;
                if (nextInterval < 1000) {
                    this.timerInterval = 1000;
                } else if (nextInterval > 10000) {
                    this.timerInterval = 10000;
                } else {
                    this.timerInterval = nextInterval;
                }
                this.timerInterval = nextInterval < 1000 ? 1000 : nextInterval;
            } else if (diff == 0) {
                this.timerInterval = 1000;
            }
            this.timeouts.push(window.setTimeout(callBack, this.timerInterval));
        };
        callBack();
    }
}