import { Component, Input } from 'angular2/core';

@Component({
    selector: 'tab',
    styleUrls: ['styles/tabs.style.css'],
    templateUrl: 'templates/tab.component.html'
})
export class TabComponent {
    @Input('tabTitle') title: string;
    @Input() active = false;
}