export class FileUtilities {
  private static readonly binaryExtensions = [
    '.zip',
    '.exe',
    '.dll',
    '.png',
    '.jpeg',
    '.jpg',
    '.gif',
    '.bmp',
    '.ico',
    '.pdf',
    '.so',
    '.ttf',
    '.bz2',
    '.gz',
    '.jar',
    '.cab',
    '.tar',
    '.iso',
    '.img',
    '.dmg',
  ];

  public static isBinary(fileName: string): boolean {
    return !!fileName && FileUtilities.binaryExtensions.some(e => fileName.toLowerCase().endsWith(e));
  }

  // https://github.com/eligrey/FileSaver.js/blob/00e540fda507173f83a9408f1604622538d0c81a/src/FileSaver.js#L128-L136
  public static saveFile(blob: Blob, fileName: string) {
    const windowUrl = window.URL || (<any>window).webkitURL;
    if (window.navigator.msSaveOrOpenBlob) {
      // Currently, Edge doesn' respect the "download" attribute to name the file from blob
      // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7260192/
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      const anchor = document.createElement('a');
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      // http://stackoverflow.com/questions/37432609/how-to-avoid-adding-prefix-unsafe-to-link-by-angular2
      setTimeout(() => {
        const url = windowUrl.createObjectURL(blob);
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }
}
