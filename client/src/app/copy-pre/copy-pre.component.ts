import { Component, Input, OnInit } from '@angular/core';
import { UtilitiesService } from '../shared/services/utilities.service';

@Component({
    selector: 'copy-pre',
    templateUrl: './copy-pre.component.html',
    styleUrls: ['./copy-pre.component.scss']
})
export class CopyPreComponent implements OnInit {
    @Input() selectOnClick = true;
    @Input() content: string;
    @Input() label: string;
    @Input() passwordField = false;

    public contentView = true;
    public contentHidden = '●●●●●●●●●●●●●●●';
    constructor(private _utilities: UtilitiesService) {
    }

    ngOnInit() {
        this.contentView = !this.passwordField;
    }

    highlightText(event: Event) {
        if (this.selectOnClick) {
            this._utilities.highlightText(<Element>event.target);
        }
    }

    copyToClipboard() {
        this._utilities.copyContentToClipboard(this.content);
    }

    showPassword() {
      this.contentView = true;
    }
    hidePassword() {
      this.contentView = false;
    }
}
