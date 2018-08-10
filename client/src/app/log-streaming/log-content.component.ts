import { Component, Input } from '@angular/core';
import { LogConsoleTypes } from '../shared/models/constants';

@Component({
    template: `<div class="log-content" [class.info-content]= "type === types.Info" [class.error-content]= "type === types.Error" [class.warning-content]= "type === types.Warning">{{logs}}</div>`,
    styleUrls: ['log-streaming.component.scss']
})
export class LogContentComponent {
    public types = LogConsoleTypes;
    @Input() type: number;
    @Input() logs: string;
}
