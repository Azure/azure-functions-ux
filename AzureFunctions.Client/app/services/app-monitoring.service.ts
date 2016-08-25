import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import {PortalService} from './portal.service';
import {UserService} from './user.service';
import {FunctionsService} from '../services/functions.service';
import {GlobalStateService} from '../services/global-state.service';
import {UsageVolume} from '../models/app-monitoring-usage'

@Injectable()
export class MonitoringService {
    private token: string;

    constructor(
        private _userService: UserService,
        private _http: Http,
        private _functionsService: FunctionsService,
        private _globalStateService: GlobalStateService
    ) {
        if (!this._globalStateService.showTryView) {
            this._userService.getToken().subscribe(t => this.token = t);
        }
    }

    private getHeadersForScmSite(scmCreds?: string): Headers {
        var contentType = 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);

        if (scmCreds) {
            headers.append('Authorization', `Basic ${scmCreds}`);
        } else if (this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }

        return headers;
    }

    getAppConsumptionData(startTimeUTC: string, endTimeUTC: string, numberBuckets: number) {
         var url = this._functionsService.getScmUrl() + "/AZUREJOBS/api/functions/volume?startTime=" + startTimeUTC + "&endTime=" + endTimeUTC + "&numberBuckets=" + numberBuckets;
        return this._http.get(url, { headers: this.getHeadersForScmSite(this._globalStateService.ScmCreds) })
             .retry(3)
             .map<UsageVolume>(r => r.json());
     }
}