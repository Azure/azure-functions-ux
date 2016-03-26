import {Component, Input, OnInit} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';

@Component({
    selector: 'function-monitor',
    template:`<div class="wrapper">
    <div class="text-center">
        <p>Integrated view coming soon. Please use the links below:</p>
    </div>
    <div class="text-center">
        <a [attr.href]="dashboardUrl" target="_blank">View the invocation log <i class="fa fa-external-link"></i></a>
        <br/>
        <a [attr.href]="pulseUrl" target="_blank">View the live event stream <i class="fa fa-external-link"></i></a>
    </div>
    <div class="text-center">
        <p></p>
        <img src="/images/monitoring-coming-soon.png" />
    </div>
</div>`,
})
export class FunctionMonitorComponent implements OnInit {
    @Input() selectedFunction: FunctionInfo;
    public dashboardUrl: string;
    public pulseUrl: string;
    constructor() {}

    ngOnInit(){
        var scmUrl = this.selectedFunction.href.substring(0, this.selectedFunction.href.indexOf('/api/'));
        this.dashboardUrl = `${scmUrl}/azurejobs/#/functions`;
        this.pulseUrl = `${scmUrl}/azurejobs/#/functions`;
    }
}