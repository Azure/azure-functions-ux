import {Component, Input, Inject, ElementRef} from '@angular/core';
import {UtilitiesService} from '../shared/services/utilities.service';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'copy-pre',
  templateUrl: './copy-pre.component.html',
  styleUrls: ['./copy-pre.component.css']
})
export class CopyPreComponent {
    @Input() selectOnClick: boolean = true;
    @Input() content: string;
    @Input() label: string;

    constructor(
        @Inject(ElementRef) private elementRef: ElementRef,
        private _utilities: UtilitiesService) { }

    highlightText(event: Event) {
        if (this.selectOnClick) {
            this._utilities.highlightText(<Element>event.target);
        }
    }

    copyToClipboard(event) {
        this._utilities.copyContentToClipboard(this.content);
    }
}
