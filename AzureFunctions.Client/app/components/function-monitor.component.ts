import {Component, Input, OnInit} from '@angular/core';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';

@Component({
    selector: 'function-monitor',
    template:`
    <div class="wrapper">
        <div class="text-center">
            <p>Stay tuned for the new integrated view - it's coming soon.</p>
        </div>
        <div class="text-center">
            <p>
                Until then, you can still see your Azure Functions 
                <a [attr.href]="dashboardUrl" target="_blank">invocation log</a> and 
                <a [attr.href]="pulseUrl" target="_blank">live event stream</a>.
            </p> 
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
    constructor(private _functionsService : FunctionsService) {}

    ngOnInit(){
        var site = this._functionsService.getSiteName();
        var funcName = this.selectedFunction.name;
        var scmUrl = this.selectedFunction.href.substring(0, this.selectedFunction.href.indexOf('/api/'));
        this.dashboardUrl = `${scmUrl}/azurejobs/#/functions`;
        this.pulseUrl = `https://support-bay.scm.azurewebsites.net/Support.functionsmetrics/#/${site}/${funcName}`;
    }
}