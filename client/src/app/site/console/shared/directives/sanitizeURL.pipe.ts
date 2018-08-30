import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'sanitizeURL',
})
export class SanitizeURL implements PipeTransform {

    constructor(private _sanitizer: DomSanitizer) {}

    transform(url) {
        // https://stackoverflow.com/questions/38037760/how-to-set-iframe-src-in-angular-2-without-causing-unsafe-value-exception
        // This is safe to do since the URL is not an user input.
        return this._sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
