import { Injectable } from '@angular/core';
import { Headers, Response } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';

import { Constants } from './../models/constants';
import { CacheService } from './cache.service';
import { StartupInfo } from './../models/portal';
import { UserService } from './user.service';

@Injectable()
export class LanguageService {

    private _startupInfo: StartupInfo;

    constructor(
        private _userService: UserService,
        private _cacheService: CacheService,
        private _translateService: TranslateService) {

        this._userService.getStartupInfo()
        .subscribe(startupInfo => {
            this._startupInfo = startupInfo;
        })
    }

    getResources(extensionVersion: string) {
        return this._getLocalizedResources(this._startupInfo, extensionVersion)
    }

    private _getLocalizedResources(startupInfo: StartupInfo, runtime: string): Observable<any> {
        let lang = "en";
        runtime = runtime ? runtime : "default";

        if (this._userService.inIFrame) {

            // Effective language has language and formatting information eg: "en.en-us"
            lang = startupInfo.effectiveLocale.split(".")[0];
        }

        return this._cacheService.get(
            `${Constants.serviceHost}api/resources?name=${lang}&runtime=${runtime}`,
            false,
            this._getApiControllerHeaders(null))

            .retryWhen(this._retryAntares)
            .map(r => {
                var resources = r.json();

                this._translateService.setDefaultLang("en");
                this._translateService.setTranslation("en", resources.en);
                if (resources.lang) {
                    this._translateService.setTranslation(lang, resources.lang);
                }
                this._translateService.use(lang);
            });
    }

    private _getApiControllerHeaders(token: string, contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (token) {
            headers.append('client-token', token);
            headers.append('portal-token', token);
        }

        return headers;
    }

    private _retryAntares(error: Observable<any>): Observable<any> {
        return error.scan((errorCount : number, err: Response) => {
            if (errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }

}
