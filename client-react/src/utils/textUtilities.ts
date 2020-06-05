export class TextUtilitiesService {
  public static fallbackCopyTextToClipboard(text: string, componentRef?: any) {
    // This way is less reliable but is the only way on older browser versions and IE
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    if (componentRef && componentRef.focus) {
      componentRef.focus();
    }
  }

  public static copyContentToClipboard(text: string, componentRef?: any) {
    const nav = navigator as any;
    if (!nav.clipboard) {
      this.fallbackCopyTextToClipboard(text, componentRef);
      return;
    }
    // This method should work on most modern browsers
    nav.clipboard.writeText(text).catch(() => this.fallbackCopyTextToClipboard(text, componentRef));
  }
}
