export class GUID {
    public static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

export function versionCompare(version1: string, version2: string): -1 | 0 | 1 {
    let v1parts = version1.split('.');
    let v2parts = version2.split('.');

    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");

    for (var i = 0; i < v1parts.length; ++i) {
        if (+v1parts[i] === +v2parts[i]) {
            continue;
        }
        else if (+v1parts[i] > +v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }
    return 0;
}

export function isNumericVersion(version: string){
    const regex = /^(?! )((?!  )(?! $)[a-zA-Z ]){1,50}$/;
    return regex.test(version);
}