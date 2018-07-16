import {Component, Input} from '@angular/core';
@Component({
    template: `<div id = "prompt" class = "console-prompt-box" ><span class = "console-prompt-label">{{dir}}</span><span class = "console-prompt" aria-live="polite"><span class="console-command">{{commandInParts.leftCmd}}</span><span class = "console-cursor" *ngIf = "isFocused" >{{commandInParts.middleCmd}}</span>{{commandInParts.rightCmd}}</span></div>`,
    styleUrls: ['./../../console.component.scss', './../../bash/bash.component.scss']
})
export class BashPromptComponent {
    @Input() dir = '';
    @Input() command = '';
    @Input() commandInParts = {leftCmd: '', middleCmd: ' ' , rightCmd: ''};
    @Input() isFocused = true;
    constructor() {
    }
}
