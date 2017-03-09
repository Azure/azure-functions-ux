import { Component, Input } from '@angular/core';

@Component({
    selector: 'tab',
    styleUrls: ['../tabs/tabs.component.scss'],
    templateUrl: './tab.component.html'
})
export class TabComponent {
    @Input('tabTitle') title: string;
    @Input() active = false;
    @Input() closeable = false;
}