import { Component, Input } from '@angular/core';
import { LogLevel } from '../../shared/models/constants';

@Component({
    selector: 'log-entry',
    template: `<div class="log-content" [ngClass]="getClassForLogType()">{{message}}</div>`,
    styleUrls: ['./log-stream.component.scss']
})
export class LogEntryComponent {
    @Input() level: LogLevel;
    @Input() message: string;

    /**
     * Return class according to the log type.
     * If the log-type is normal, empty string is returned.
     */
    getClassForLogType(): string {
        if (this.level === LogLevel.Error) {
            return 'error-content';
        }
        if (this.level === LogLevel.Info) {
            return 'info-content';
        }
        if (this.level === LogLevel.Warning) {
            return 'warning-content';
        }
        return '';
    }
}