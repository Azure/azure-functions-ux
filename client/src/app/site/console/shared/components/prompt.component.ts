import { Component, Input } from '@angular/core';
import { ConsoleTypes } from '../services/console.service';
@Component({
  template: `<div id = "prompt" class = "console-prompt-box" ><span class = "console-prompt-label">{{dir}}</span><span class = "console-prompt" aria-live="polite"><span class="console-command">{{commandInParts.leftCmd}}</span><span class = "console-cursor" [class.bash-cursor] = "consoleType === types.BASH" *ngIf = "isFocused" >{{commandInParts.middleCmd}}</span>{{commandInParts.rightCmd}}</span></div>`,
  styleUrls: ['./../../console.component.scss'],
})
export class PromptComponent {
  public types = ConsoleTypes;
  @Input()
  dir = '';
  @Input()
  command = '';
  @Input()
  commandInParts = { leftCmd: '', middleCmd: ' ', rightCmd: '' };
  @Input()
  isFocused = true;
  @Input()
  consoleType: number;
  constructor() {}
}
