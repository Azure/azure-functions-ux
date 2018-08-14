import { Component, Input } from '@angular/core';
import { LogConsoleTypes } from '../../shared/models/constants';

@Component({
    template: `<div class="log-content" [ngClass]="getClassForLogType()">{{logs}}</div>`,
    styleUrls: ['./log-stream.component.scss']
})
export class LogContentComponent {
    @Input() type: number;
    @Input() logs: string;

    /**
     * Return class according to the log type.
     * If the log-type is normal, empty string is returned.
     */
    getClassForLogType(): string {
        if (this.type === LogConsoleTypes.Error) {
            return 'error-content';
        }
        if (this.type === LogConsoleTypes.Info) {
            return 'info-content';
        }
        if (this.type === LogConsoleTypes.Warning) {
            return 'warning-content';
        }
        return '';
    }
}
