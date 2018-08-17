import {Component, Input} from '@angular/core';
@Component({
    template: `<span id= "prompt" class= "console-prompt" ><span class = "console-prompt-label">{{dir}}</span><span class = "console-prompt-body" aria-live="polite"><span class="console-command">{{ command.left }}</span><span class= "console-cursor" [class.linux-cursor] = "isLinux" *ngIf= "isFocused">{{ command.mid }}</span>{{ command.right }}</span></span>`,
    styleUrls: ['./../function-console.component.scss']
})
export class PromptComponent {
    @Input() dir = '';
    @Input() command = {left: '', mid: ' ' , right: '', complete: ''};
    @Input() isFocused: boolean;
    @Input() isLinux = false;
    constructor() {
    }
}
