import { Component, Input } from '@angular/core';
import { UtilitiesService } from '../shared/services/utilities.service';

@Component({
    selector: 'copy-pre',
    templateUrl: './copy-pre.component.html',
    styleUrls: ['./copy-pre.component.scss']
})
export class CopyPreComponent {
    @Input() selectOnClick = true;
    @Input() content: string;
    @Input() label: string;

    constructor(private _utilities: UtilitiesService) { }

    highlightText(event: Event) {
        if (this.selectOnClick) {
            this._utilities.highlightText(<Element>event.target);
        }
    }

    copyToClipboard() {
        this._utilities.copyContentToClipboard(this.content);
    }
}
