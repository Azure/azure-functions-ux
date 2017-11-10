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

    constructor() { }

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
