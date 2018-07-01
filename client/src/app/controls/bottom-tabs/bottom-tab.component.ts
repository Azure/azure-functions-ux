import { BottomTabCommand } from './bottom-tab.component';
import { Input, Component } from '@angular/core';

export interface BottomTabCommand{
    iconUrl: string;
    text: string;
    click: () => void;
}

@Component({
    selector: 'bottom-tab',
    template: ''
})
export class BottomTabComponent {
    @Input() title: string;
    @Input() id: string;
    @Input() active = false;

    commands: BottomTabCommand[];
}