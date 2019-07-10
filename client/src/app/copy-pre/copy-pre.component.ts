import { Component, Input, OnInit } from '@angular/core';
import { UtilitiesService } from '../shared/services/utilities.service';
import { KeyCodes } from '../shared/models/constants';

@Component({
  selector: 'copy-pre',
  templateUrl: './copy-pre.component.html',
  styleUrls: ['./copy-pre.component.scss'],
})
export class CopyPreComponent implements OnInit {
  @Input()
  selectOnClick = true;
  @Input()
  content: string;
  @Input()
  label: string;
  @Input()
  passwordField = false;
  @Input()
  copyableString: string = null;
  @Input()
  onlyCopyButton = false;

  public contentView = true;
  public hiddenContentPlaceholder = '●●●●●●●●●●●●●●●';
  constructor(private _utilities: UtilitiesService) {}

  ngOnInit() {
    this.contentView = !this.passwordField;
  }

  highlightText(event: Event) {
    if (this.selectOnClick) {
      this._utilities.highlightText(<Element>event.target);
    }
  }

  copyToClipboard() {
    this._utilities.copyContentToClipboard(this.copyableString || this.content);
  }

  showPassword() {
    this.contentView = true;
  }

  hidePassword() {
    this.contentView = false;
  }

  onKeyPress(event: KeyboardEvent, func: 'hide' | 'show' | 'copy') {
    if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
      switch (func) {
        case 'hide':
          this.hidePassword();
          break;
        case 'show':
          this.showPassword();
          break;
        case 'copy':
          this.copyToClipboard();
          break;
      }
    }
  }
}
