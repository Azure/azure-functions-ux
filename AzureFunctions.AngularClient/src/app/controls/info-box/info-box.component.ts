import { KeyCodes } from './../../shared/models/constants';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'info-box',
    templateUrl: './info-box.component.html',
    styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent {

    @Input() infoText: string = null;
    @Input() infoLink: string = null;

    public typeClass = 'info';
    public iconPath = 'image/info.svg';

    @Input('typeClass') set type(value: 'info' | 'warning' | 'error') {
        switch (value) {
            case 'info':
                this.typeClass = 'info';
                this.iconPath = 'image/info.svg';
                break;
            case 'warning':
                this.typeClass = 'warning';
                this.iconPath = 'image/warning.svg';
                break;
            case 'error':
                this.typeClass = 'error';
                this.iconPath = 'image/error.svg';
                break;
        }
    }

    onClick(event: any) {
        if (!!this.infoLink) {
            window.open(this.infoLink, '_blank');
        }
    }

    onKeyPress(event: KeyboardEvent) {
        if (!!this.infoLink && event.keyCode === KeyCodes.enter) {
            window.open(this.infoLink, '_blank');
        }
    }
}
