import { Component, Input } from '@angular/core';
import { LogLevel } from '../shared/models/constants';

@Component({
  selector: 'log-content',
  template: `<div class="log-content" [ngClass]="getClassForLogType()">{{logs}}</div>`,
  styleUrls: ['./log-streaming.component.scss'],
})
export class LogContentComponent {
  @Input()
  type: LogLevel;
  @Input()
  logs: string;

  /**
   * Return class according to the log type.
   * If the log-type is normal, empty string is returned.
   */
  getClassForLogType(): string {
    if (this.type === LogLevel.Error) {
      return 'error-content';
    }
    if (this.type === LogLevel.Info) {
      return 'info-content';
    }
    if (this.type === LogLevel.Warning) {
      return 'warning-content';
    }
    return '';
  }
}
