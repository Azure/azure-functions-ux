import {Component, Input} from '@angular/core';

@Component({
    template: `<div class = "console-prompt-box" id = "prompt"><span class = "console-prompt-label">{{dir}}></span><span class = "console-prompt" aria-live="polite"><span class="console-command">{{commandInParts.lCmd}}</span><span class = "console-cursor" *ngIf = "isFocused" >{{commandInParts.mCmd}}</span>{{commandInParts.rCmd}}</span></div>`,
    styleUrls: ['./../console.component.scss']
})
export class PromptComponent {
    @Input() dir = '';
    @Input() command = '';
    @Input() commandInParts = {lCmd: '', mCmd: ' ' , rCmd: ''};
    @Input() isFocused = true;
    constructor() {
    }
}