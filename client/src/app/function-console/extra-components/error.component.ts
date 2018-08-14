import {Component, Input} from '@angular/core';
@Component({
    template: `<div class = "console-error">{{message}}</div>`,
    styleUrls: ['./../function-console.component.scss']
})
export class ErrorComponent {
    @Input() message: string;
    constructor() {
    }
}
