import { LogCategories } from './../../shared/models/constants';
import { Guid } from './../../shared/Utilities/Guid';
import { LogService } from './../../shared/services/log.service';
import { CacheService } from './../../shared/services/cache.service';
import { Input, ElementRef, Directive, OnChanges } from '@angular/core';
import { Headers } from '@angular/http';

@Directive({
    selector: '[load-image]',
})
export class LoadImageDirective implements OnChanges {

    @Input('load-image') imageUrl: string;

    constructor(
        private _cacheService: CacheService,
        private _logService: LogService,
        private _elementRef: ElementRef) {
    }

    ngOnChanges() {
        if (this.imageUrl) {
            if (!this.imageUrl.toLowerCase().endsWith('.svg')) {
                this._elementRef.nativeElement.innerHTML = `<img src="${this.imageUrl}" />`;
            } else {
                const headers = new Headers();
                headers.append('Accept', 'image/webp,image/apng,image/*,*/*;q=0.8');
                headers.append('x-ms-client-request-id', Guid.newGuid());
                // headers.append('Cache-Control', 'max-age=60000');

                // Static content should be taking advantage of browser caching so using the
                // cacheService isn't entirely necessary, though it does mimic actual browser
                // behavior a little better which doesn't make new requests (even to local disk) for
                // every instance of an image
                this._cacheService.get(this.imageUrl, false, headers)
                    .subscribe(image => {
                        this._elementRef.nativeElement.innerHTML = image.text();
                    }, (e => {
                        this._logService.error(LogCategories.svgLoader, '/download-image', e);
                    }));
            }
        }
    }
}
