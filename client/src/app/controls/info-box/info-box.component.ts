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
    @Input() infoActionFn: () => void = null;
    @Input() infoActionIcon: string = null;
    @Input() dismissable = false;

    public typeClass = 'info';
    public iconPath = 'image/info.svg';
    public dismissed = false;

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
        this._invoke();
    }

    onDismiss() {
        this.dismissed = true;
    }

    onKeyPress(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter) {
            this._invoke();
        }
    }

    private _invoke() {
        if (!!this.infoActionFn) {
            this.infoActionFn();
        } else if (!!this.infoLink) {
            window.open(this.infoLink, '_blank');
        }
    }
}
