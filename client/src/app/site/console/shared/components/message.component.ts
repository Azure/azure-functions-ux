import { Component, Input } from '@angular/core';
@Component({
  template: `<div [class]="className">{{message}}</div><i *ngIf="loading" class="fa fa-spinner fa-spin fa-fw"></i>`,
  styleUrls: ['./../../console.component.scss'],
})
export class MessageComponent {
  @Input()
  message: string;
  @Input()
  loading: boolean;
  @Input('isCommand')
  set isCommand(value: boolean) {
    this.className = value ? 'console-message-command' : 'console-message-value';
  }
  className = 'console-message-value';
  constructor() {}
}
