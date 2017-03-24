import { Component, Input } from '@angular/core';

@Component({
    selector: 'tab',
    styleUrls: ['../tabs/tabs.component.scss'],
    templateUrl: './tab.component.html'
})
export class TabComponent {
    @Input() title : string;
    @Input() id : string;
    @Input() active = false;
    @Input() closeable = false;
}