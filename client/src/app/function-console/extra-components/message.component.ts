import {Component, Input} from '@angular/core';
@Component({
    template: `<div class = "console-message">{{message}}</div><i *ngIf="loading" class="fa fa-spinner fa-spin fa-fw"></i>`,
    styleUrls: ['./../function-console.component.scss']
})
export class MessageComponent {
    @Input() message: string;
    @Input() loading: boolean;
    constructor() {
    }
}
