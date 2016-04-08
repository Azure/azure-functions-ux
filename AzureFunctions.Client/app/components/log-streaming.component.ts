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
    private timerId: number;
    @Input() functionInfo: FunctionInfo;

    constructor(
        @Inject(ElementRef) private _elementRef: ElementRef,
        private _userService: UserService,
        private _functionsService: FunctionsService,
        private _broadcastService: IBroadcastService,
        private _utilities: UtilitiesService) {
        this.hostErrors = '';
    }

    ngOnChanges() {
        this.initLogs();
        this.startLogs()
    }

    ngOnDestroy() {
        if (this.xhReq){
            window.clearInterval(this.timerId);
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
            window.clearInterval(this.timerId);
            this.log = '';
            this.xhReq.abort();
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

        this.timerId = window.setInterval(() => {
            if (!this.stopped) {
                this.log = this.hostErrors + this.xhReq.responseText;
                window.setTimeout(() => {
                    var el = document.getElementById('log-stream');
                    if (el) {
                        el.scrollTop = el.scrollHeight;
                    }
                });
            }

        }, 1000);
    }
}