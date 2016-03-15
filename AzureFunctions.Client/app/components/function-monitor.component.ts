import {Component, Input} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';

@Component({
    selector: 'function-monitor',
    template:`<div class="wrapper">
    <a [attr.href]="selectedFunction?.href" target="_blank">Take me to the metrics!<i class="fa fa-external-link"></i></a>
    <h2>Integrated view coming soon!</h2>
    <div>
        <p>Per-function monitoring is not currently available in this view, but we're working on it. For now, you can view them through the SDK dashboard linked above, which is hosted by your function app</p>
        <p>You can also see aggregate metrics for the entire function app using the "Monitoring" command in the top-right.</p>
    </div>
</div>`,
})
export class FunctionMonitorComponent {
    @Input() selectedFunction: FunctionInfo;
    constructor() {}
}