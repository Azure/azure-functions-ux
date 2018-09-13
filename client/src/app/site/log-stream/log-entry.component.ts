import { Component, Input } from '@angular/core';
import { LogLevel } from '../../shared/models/constants';

@Component({
    selector: 'log-entry',
    template: `<div class="log-content" [ngClass]="className">{{message}}</div>`,
    styleUrls: ['./log-stream.component.scss'],

})
export class LogEntryComponent {

    @Input() set level(level: LogLevel) {
        if (level === LogLevel.Error) {
            this.className = 'error-content';
        } else if (level === LogLevel.Info) {
            this.className = 'info-content';
        } else if (level === LogLevel.Warning) {
            this.className = 'warning-content';
        } else {
            this.className = '';
        }
    }

    @Input() message: string;
    className: string;
}
