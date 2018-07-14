import {Component, Input} from '@angular/core';
import { slideUpDown } from '../animations/slideUp.animation';
@Component({
    template: `<div class = "console-message-value">{{message}}</div><i *ngIf="loading" class="fa fa-spinner fa-spin fa-fw"></i>`,
    styleUrls: ['./../../console.component.scss'],
    animations: [
        slideUpDown
    ]
})
export class MessageComponent {
    @Input() message: string;
    @Input() loading: boolean;
    constructor() {
    }
}
