import {Component, Input} from '@angular/core';
@Component({
    template: `<div class = "console-message-error">{{message}}</div>`,
    styleUrls: ['./../../console.component.scss']
})
export class ErrorComponent {
    @Input() message: string;
    constructor() {
    }
}
