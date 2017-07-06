import { Subject } from 'rxjs/Subject';
import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'command-bar',
  template: `
    <div class="command-bar-wrapper">
      <ng-content></ng-content>
    </div>`
})
export class CommandBarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
