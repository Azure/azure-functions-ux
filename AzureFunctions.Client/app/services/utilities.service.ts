import {Injectable} from '@angular/core';

@Injectable()
export class UtilitiesService {

    //http://stackoverflow.com/q/8019534/3234163
    highlightText(e: Element) {
        var range = document.createRange();
        range.selectNodeContents(e);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    unHighlightText() {
        var sel = window.getSelection();
        sel.removeAllRanges();
    }

    copyContentToClipboard(e: Element) {
        this.highlightText(e);
        try {
            var result = document.execCommand('copy');
            console.log(result);
        } catch (e) {
            console.log(e);
        }
        this.unHighlightText();
    }
}