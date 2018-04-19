import { LanguageServiceHelper } from './language.service-helper';
import { Injectable } from '@angular/core';
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

        const input = LanguageServiceHelper.getLanguageAndRuntime(startupInfo, runtime);

        return this._cacheService.get(
            `${Constants.serviceHost}api/resources?name=${input.lang}&runtime=${input.runtime}`,
            false,
            LanguageServiceHelper.getApiControllerHeaders())

            .retryWhen(LanguageServiceHelper.retry)
            .map(r => {
                const resources = r.json();
                LanguageServiceHelper.setTranslation(resources, input.lang, this._translateService);
            });
    }
}
