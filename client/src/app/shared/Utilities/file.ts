
export class FileUtilities {
    private static readonly binaryExtensions = [
        '.zip', '.exe', '.dll', '.png', '.jpeg', '.jpg', '.gif', '.bmp', '.ico', '.pdf', '.so', '.ttf', '.bz2', '.gz', '.jar', '.cab', '.tar', '.iso', '.img', '.dmg'
    ];

    public static isBinary(fileName: string): boolean {
        return !!fileName && FileUtilities.binaryExtensions.some(e => fileName.toLowerCase().endsWith(e));
    }
}
