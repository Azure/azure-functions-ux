import { Component, Input } from '@angular/core';

@Component({
    selector: 'tab',
    templateUrl: './tab.component.html'
})
export class TabComponent {
    @Input() title: string;
    @Input() id: string;
    @Input() active = false;
    @Input() closeable = false;
    @Input() iconUrl: string;
}