import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import {PortalService} from './portal.service';
import {UserService} from './user.service';
import {FunctionsService} from '../services/functions.service';
import {UsageVolume} from '../models/app-monitoring-usage'

@Injectable()
export class MonitoringService {
    private token: string;

    constructor(
        private _userService: UserService,
        private _http: Http,
        private _functionsService: FunctionsService
    ) {
        this._userService.getToken().subscribe(t => this.token = t);
    }

    private getHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);

        if (this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }
        return headers;
    }

    getAppConsumptionData(startTimeUTC: string, endTimeUTC: string, numberBuckets: number) {
        var url = this._functionsService.getScmUrl() + "/AZUREJOBS/api/functions/volume?startTime=" + startTimeUTC + "&endTime=" + endTimeUTC + "&numberBuckets=" + numberBuckets;
          return this._http.get(url, { headers: this.getHeaders() })
            .retry(3)
            .map<UsageVolume>(r => r.json());
    }
}