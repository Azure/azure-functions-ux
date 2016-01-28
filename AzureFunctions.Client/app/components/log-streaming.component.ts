import {Component, OnInit} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';

@Component({
    selector: 'log-streaming',
    templateUrl: 'templates/log-streaming.html',
    inputs: ['functionInfo']
})
export class LogStreamingComponent implements OnInit {
    public functionInfo: FunctionInfo;
    public log: string;
    private basic: string;
    private scmUrl: string;
    private nextReadPos: number;

    constructor(private _functionsService: FunctionsService) {
        this.nextReadPos = 0;
        this.basic = _functionsService.getBasicHeader();
        this.scmUrl = _functionsService.getScmUrl();
    }

    ngOnInit() {
        var xhReq = new XMLHttpRequest();
        xhReq.open('GET', `${this.scmUrl}/api/logstream/application`, true);
        xhReq.setRequestHeader('Authorization', this.basic);
        //xhReq.setRequestHeader('Accept', '*/*');
        xhReq.setRequestHeader('Accept-Encoding', 'deflate');

        xhReq.send(null);
        var nextReadPos = 0;
        var pollTimer = setInterval(() => {
            this.log = xhReq.responseText;
            //var unprocessed = allMessages.substring(nextReadPos);
            //if (unprocessed.length > 0) {
            //    this.renderMessage(unprocessed);
            //    nextReadPos += unprocessed.length;
            //}
        }, 1000);
    }
}