import {Component, OnInit, OnDestroy} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';

@Component({
    selector: 'log-streaming',
    templateUrl: 'templates/log-streaming.component.html',
    inputs: ['functionInfo'],
    styleUrls: ['styles/function-dev.style.css']
})
export class LogStreamingComponent implements OnDestroy {
    public log: string;
    public stopped: boolean;
    private xhReq: XMLHttpRequest;
    private basic: string;
    private scmUrl: string;
    private timerId: number;
    private _functionInfo: FunctionInfo;

    constructor(private _functionsService: FunctionsService) {
        this.basic = _functionsService.getBasicHeader();
        this.scmUrl = _functionsService.getScmUrl();
    }

    set functionInfo(value: FunctionInfo) {
        this._functionInfo = value;
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

    private initLogs(){
        if (this.xhReq) {
            window.clearInterval(this.timerId);
            this.log = '';
            this.xhReq.abort();
        }

        this.xhReq = new XMLHttpRequest();
        this.xhReq.open('GET', `${this.scmUrl}/api/logstream/application/functions/function/${this._functionInfo.name}`, true);
        this.xhReq.setRequestHeader('Authorization', this.basic);
        this.xhReq.setRequestHeader('FunctionsPortal', '1');
        this.xhReq.send(null);

        this.timerId = window.setInterval(() => {
            if (!this.stopped) {
                this.log = this.xhReq.responseText;
            }

            window.setTimeout(() => {
                var el = document.getElementById('log-stream');
                if (el) {
                    el.scrollTop = el.scrollHeight;
                }
            });
        }, 1000);           
    }
}