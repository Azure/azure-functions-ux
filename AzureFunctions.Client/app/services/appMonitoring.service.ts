import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import {PortalService} from './portal.service';
import {UserService} from './user.service';
import {FunctionsService} from '../services/functions.service';
import {MonitoringConsumption} from '../models/appMonitoring-consumption';

@Injectable()
export class MonitoringService {
    private token: string;

    constructor(
        private _userService: UserService,
        private _http: Http,
        private _functionsService: FunctionsService
    ) {
        if (!window.location.pathname.endsWith('/try')) {
            this._userService.getToken().subscribe(t => this.token = t);
        }
    }

    private getHeaders(scmCreds?: string): Headers {
        var contentType = 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);

        if (scmCreds) {
            headers.append('Authorization', `Basic `+ scmCreds);
        } else if (this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }

        return headers;
    }

    getFunctionAppConsumptionData(scmCreds?:string) {
        var utcDate = new Date().toJSON().slice(0, 10);
        var url = this._functionsService.getScmUrl() + "/AZUREJOBS/api/containers/timeline?start=" + utcDate;
        return this._http.get(url, { headers: this.getHeaders(scmCreds) })
            .retry(3)
            .map<MonitoringConsumption[]>(r => r.json().results);
    }
}