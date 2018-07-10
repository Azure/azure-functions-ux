import { KeyCodes } from './../../shared/models/constants';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'info-box',
    templateUrl: './info-box.component.html',
    styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent {

    private static _dismissedIds: { [key: string]: boolean } = {};
    private _dismissId: string;

    public typeClass = 'info';
    public iconPath = 'image/info.svg';
    public dismissed = false;

    @Input() infoText: string = null;
    @Input() infoLink: string = null;
    @Input() infoActionFn: () => void = null;
    @Input() infoActionIcon: string = null;
    @Input() dismissable = false;

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

    @Input('dismissId') set id(value: string) {
        this.dismissed = InfoBoxComponent._dismissedIds && InfoBoxComponent._dismissedIds[value];
        this._dismissId = value;
    }

    onClick(event: any) {
        this._invoke();
    }

    onDismiss() {
        this.dismissed = true;

        if (this._dismissId) {
            InfoBoxComponent._dismissedIds[this._dismissId] = true;
        }
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
            const link = this.infoLink;
            window.open(link, '_blank');
        }
    }
}
