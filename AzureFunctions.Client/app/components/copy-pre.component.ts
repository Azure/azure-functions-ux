import {Component, Input, Inject, ElementRef} from '@angular/core';
import {PopOverComponent} from './pop-over.component';
import {UtilitiesService} from '../services/utilities.service';

@Component({
    selector: 'copy-pre',
    templateUrl: 'templates/copy-pre.component.html',
    styleUrls: ['styles/copy-pre.style.css'],
    directives: [PopOverComponent]
})
export class CopyPreComponent {
    @Input() selectOnClick: boolean = true;
    @Input() content: string;

    constructor(
        @Inject(ElementRef) private elementRef: ElementRef,
        private _utilities: UtilitiesService) { }

    highlightText(event: Event) {
        if (this.selectOnClick) {
            this._utilities.highlightText(<Element>event.target);
        }
    }

    copyToClipboard(event) {
        this._utilities.copyContentToClipboard(this.elementRef.nativeElement.querySelector('pre'));
    }
}