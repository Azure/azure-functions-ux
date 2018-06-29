import {Component, Input} from '@angular/core';

@Component({
    template: `<div class = "console-prompt-box" id = "prompt"><span class = "console-prompt-label">{{dir}}></span><span class = "console-prompt" aria-live="polite"><span class="console-command">{{commandInParts.lCmd}}</span><span class = "console-cursor" *ngIf = "isFocused" >{{commandInParts.mCmd}}</span>{{commandInParts.rCmd}}</span></div>`,
    styleUrls: ['./../console.component.scss']
})
export class PromptComponent{
    @Input() dir: string = "";
    @Input() command: string = "";
    @Input() commandInParts = {lCmd: "", mCmd: "\u00A0" , rCmd: ""};
    @Input() isFocused: boolean = true;

    constructor(){

    }
    
}