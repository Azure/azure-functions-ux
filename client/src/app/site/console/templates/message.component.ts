import {Component, Input} from '@angular/core';

@Component({
    template: `<div class = "console-message-value">{{message}}</div>`,
    styleUrls: ['./../console.component.scss']
})
export class MessageComponent{
    @Input() message: string;
    constructor(){

    }
    
}