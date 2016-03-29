import {Http, Headers} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {PortalService} from './portal.service';
import {IMonitoringService} from './iappMonitoring.service';
import {UserService} from './user.service';
import {FunctionsService} from '../services/functions.service';
import {MonitoringConsumption} from '../models/appMonitoring-consumption';

@Injectable()
export class MonitoringService implements IMonitoringService {
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

    getFunctionAppConsumptionData() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        var todayStr = mm + '/' + dd + '/' + yyyy;
        var url = this._functionsService.getScmUrl() + "/AZUREJOBS/api/containers/timeline?limit=10";
        return this._http.get(url, { headers: this.getHeaders() })
            .retry(3)
            .map<MonitoringConsumption[]>(r => r.json().results);
    }
}