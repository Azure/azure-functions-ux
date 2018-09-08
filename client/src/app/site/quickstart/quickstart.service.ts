import { LanguageServiceHelper } from './../../shared/services/language.service-helper';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';
import { Headers } from '@angular/http';
import { Constants } from './../../shared/models/constants';
import { CacheService } from './../../shared/services/cache.service';
import { StartupInfo } from './../../shared/models/portal';
import { UserService } from './../../shared/services/user.service';

@Injectable()
export class QuickstartService {

    private _startupInfo: StartupInfo<void>;

    constructor(
        private _userService: UserService,
        private _cacheService: CacheService) {

        this._userService.getStartupInfo()
            .subscribe(startupInfo => {
                this._startupInfo = startupInfo;
            });
    }

    getQuickstartFile(fileName: string) {
        return this._getLocalizedQuickstart(this._startupInfo, fileName);
    }

    private _getApiControllerHeaders(): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'text/plain');
        headers.append('Accept', 'text/plain,*/*');

        return headers;
    }

    private _getLocalizedQuickstart(startupInfo: StartupInfo<void>, fileName: string) {

        const input = LanguageServiceHelper.getLanguageAndRuntime(startupInfo, null);

        return this._cacheService.get(
            `${Constants.serviceHost}api/quickstart?fileName=${fileName}&language=${input.lang}&cacheBreak=${window.appsvc.cacheBreakQuery}`,
            false,
            this._getApiControllerHeaders())
            .map(r => {
                const quickstart = r.text();
                return quickstart;
            });
    }
}
