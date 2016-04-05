import { Component, Input, Inject, ElementRef } from 'angular2/core';

@Component({
    selector: 'copy-pre',
    templateUrl: 'templates/copy-pre.component.html',
    styleUrls: ['styles/copy-pre.style.css']
})
export class CopyPreComponent {
    @Input() selectOnClick: boolean = true;
    @Input() content: string;

    constructor(@Inject(ElementRef) private elementRef: ElementRef) { }

    //http://stackoverflow.com/q/8019534/3234163
    highlightText(event: Event) {
        if (this.selectOnClick) {
            this.internalHighlightText(<Element>event.target);
        }
    }

    private internalHighlightText(e: Element) {
        var range = document.createRange();
        range.selectNodeContents(e);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    copyToClipboard() {
        var pre = this.elementRef.nativeElement.querySelector('pre');
        this.internalHighlightText(<Element> pre);
        // http://stackoverflow.com/a/30810322/3234163
        try {
            var result = document.execCommand('copy');
        } catch (e) {

        }
    }
}