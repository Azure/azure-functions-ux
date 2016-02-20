import { Component, Input } from 'angular2/core';

@Component({
    selector: 'tab',
    styles: [`
    .pane{
      padding: 1em;
    }
  `],
    template: `
    <div [hidden]="!active" class="pane">
      <ng-content></ng-content>
    </div>
  `
})
export class TabComponent {
    @Input('tabTitle') title: string;
    @Input() active = false;
}