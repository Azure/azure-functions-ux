import { KeyCodes } from './../../shared/models/constants';
import { Component, Input } from '@angular/core';

export type InfoBoxType = 'info' | 'warning' | 'error' | 'success' | 'spinner' | 'upsell';

@Component({
  selector: 'info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
})
export class InfoBoxComponent {
  private static _dismissedIds: { [key: string]: boolean } = {};
  private _dismissId: string;

  private readonly _actionIconClassDefault = 'icon-small info-box-action-icon';

  public typeClass = 'info';
  public iconPath = 'image/info.svg';
  public actionIconClass = this._actionIconClassDefault;
  public dismissed = false;

  @Input()
  isBanner = false;
  @Input()
  infoText: string = null;
  @Input()
  infoLink: string = null;
  @Input()
  infoActionFn: () => void = null;
  @Input()
  infoActionIcon: string = null;
  @Input()
  dismissable = false;

  @Input('typeClass')
  set type(value: InfoBoxType) {
    switch (value) {
      case 'info':
        this.typeClass = 'info';
        this.iconPath = 'image/info.svg';
        this.actionIconClass = this._actionIconClassDefault;
        break;
      case 'warning':
        this.typeClass = 'warning';
        this.iconPath = 'image/warning.svg';
        this.actionIconClass = this._actionIconClassDefault;
        break;
      case 'error':
        this.typeClass = 'error';
        this.iconPath = 'image/error.svg';
        this.actionIconClass = this._actionIconClassDefault;
        break;
      case 'success':
        this.typeClass = 'success';
        this.iconPath = 'image/success.svg';
        this.actionIconClass = this._actionIconClassDefault;
        break;
      case 'spinner':
        this.typeClass = 'spinner';
        this.iconPath = 'image/spinner.svg';
        this.actionIconClass = this._actionIconClassDefault;
        break;
      case 'upsell':
        this.typeClass = 'upsell';
        this.iconPath = 'image/upsell.svg';
        this.actionIconClass = 'icon-small info-box-action-icon upsell-arrow-color';
        break;
    }
  }

  @Input('dismissId')
  set id(value: string) {
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
      window.open(this.infoLink, '_blank');
    }
  }
}
