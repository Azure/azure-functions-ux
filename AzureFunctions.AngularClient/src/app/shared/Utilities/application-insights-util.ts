declare const pako: any;

export class ApplicationInsightsUtil {
    public static compressAndEncodeBase64AndUri(str) {
        var compressedBase64 = ApplicationInsightsUtil._compressAndEncodeBase64(str);
        return encodeURIComponent(compressedBase64);
    }
    
    public static decompressBase64UriComponent(compressedBase64UriComponent) {
        var compressedBase64 = decodeURIComponent(compressedBase64UriComponent);

        return ApplicationInsightsUtil._decompressBase64(compressedBase64);
    }

    private static _compressAndEncodeBase64(str) {
        var compressed = ApplicationInsightsUtil._compressString(str);
        return btoa(compressed);
    }

    private static _compressString(str) {
        var byteArray = ApplicationInsightsUtil._toUTF8Array(str);
        var compressedByteArray = pako.gzip(byteArray);
        var compressed = String.fromCharCode.apply(null, compressedByteArray);

        return compressed;
    }

    private static _decompressBase64(compressedBase64) {
        var compressed = atob(compressedBase64);

        return ApplicationInsightsUtil._decompressString(compressed);
    }

    private static _decompressString(compressed) {
        var compressedByteArray = compressed.split('').map(function (e) {
            return e.charCodeAt(0);
        });
        var decompressedByteArray = pako.inflate(compressedByteArray);
        var decompressed = ApplicationInsightsUtil._fromUTF8Array(decompressedByteArray);

        return decompressed;
    }

    private static _toUTF8Array(str) {
        var utf8 = [];
        for (var i=0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                        0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                        0x80 | ((charcode>>6) & 0x3f),
                        0x80 | (charcode & 0x3f));
            }
            else {
                i++;
                charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                        | (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >>18),
                        0x80 | ((charcode>>12) & 0x3f),
                        0x80 | ((charcode>>6) & 0x3f),
                        0x80 | (charcode & 0x3f));
            }
        }
        return utf8;
    }

    private static _fromUTF8Array(utf8) {
        var charsArray = [];
        for (var i = 0; i < utf8.length; i++) {
            var charCode, firstByte, secondByte, thirdByte, fourthByte;
            if ((utf8[i] & 0x80) === 0) {
                charCode = utf8[i];
            }
            else if ((utf8[i] & 0xE0) === 0xC0) {
                firstByte = utf8[i] & 0x1F;
                secondByte = utf8[++i] & 0x3F;
                charCode = (firstByte << 6) + secondByte;
            }
            else if ((utf8[i] & 0xF0) === 0xE0) {
                firstByte = utf8[i] & 0x0F;
                secondByte = utf8[++i] & 0x3F;
                thirdByte = utf8[++i] & 0x3F;
                charCode = (firstByte << 12) + (secondByte << 6) + thirdByte;
            }
            else if ((utf8[i] & 0xF8) === 0xF0) {
                firstByte = utf8[i] & 0x07;
                secondByte = utf8[++i] & 0x3F;
                thirdByte = utf8[++i] & 0x3F;
                fourthByte = utf8[++i] & 0x3F;
                charCode = (firstByte << 18) + (secondByte << 12) + (thirdByte << 6) + fourthByte;
            }

            charsArray.push(charCode);
        }
        return String.fromCharCode.apply(null, charsArray);
    }
}