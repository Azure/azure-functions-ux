import {Component, OnInit, OnDestroy, OnChanges, Input} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {UserService} from '../services/user.service';
import {FunctionContainer} from '../models/function-container';
import {FunctionsService} from '../services/functions.service';

@Component({
    selector: 'log-streaming',
    templateUrl: 'templates/log-streaming.component.html',
    styleUrls: ['styles/function-dev.style.css']
})
export class LogStreamingComponent implements OnDestroy, OnInit, OnChanges {
    public log: string;
    public stopped: boolean;
    private hostErrors: string;
    private xhReq: XMLHttpRequest;
    private timerId: number;
    @Input() functionInfo: FunctionInfo;

    constructor(private _userService: UserService, private _functionsService: FunctionsService) {
        this.hostErrors = '';
    }

    ngOnInit() {
        this.initLogs();
        this.startLogs()
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

    private initLogs() {
        if (this.xhReq) {
            window.clearInterval(this.timerId);
            this.log = '';
            this.xhReq.abort();
        }

        this._functionsService.getFunctionErrors(this.functionInfo)
            .subscribe((r: string[]) => this.hostErrors = r.reduce((a, b) => a + b + '\n', ''));

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