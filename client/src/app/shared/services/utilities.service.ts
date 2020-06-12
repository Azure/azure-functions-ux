import { Injectable } from '@angular/core';

@Injectable()
export class UtilitiesService {
  // http://stackoverflow.com/q/8019534/3234163
  highlightText(e: Element) {
    const range = document.createRange();
    range.selectNodeContents(e);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  unHighlightText() {
    const sel = window.getSelection();
    sel.removeAllRanges();
  }

  fallbackCopyTextToClipboard(text) {
    // This way is less reliable but is the only way on older browser versions and IE
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    // NOTE(michinoy): Adding an event listener to write to the clipboard directly
    // Idea from - https://stackoverflow.com/a/52949299

    let listener = (e?: ClipboardEvent) => {
      if (e) {
        let clipboard = e.clipboardData || window['clipboardData'];
        clipboard.setData('text', text);
        e.preventDefault();
      }
    };

    document.addEventListener('copy', listener, false);
    document.execCommand('copy');
    document.removeEventListener('copy', listener, false);

    document.body.removeChild(textArea);
  }

  copyContentToClipboard(text) {
    const nav = navigator as any;
    if (!nav.clipboard) {
      this.fallbackCopyTextToClipboard(text);
      return;
    }
    // This method should work on most modern browsers
    nav.clipboard.writeText(text).catch(() => this.fallbackCopyTextToClipboard(text));
  }
}
