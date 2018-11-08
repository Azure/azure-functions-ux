export class UtilitiesService {
  public static fallbackCopyTextToClipboard(text) {
    // This way is less reliable but is the only way on older browser versions and IE
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  public static copyContentToClipboard(text) {
    const nav = navigator as any;
    if (!nav.clipboard) {
      this.fallbackCopyTextToClipboard(text);
      return;
    }
    // This method should work on most modern browsers
    nav.clipboard.writeText(text);
  }
}
