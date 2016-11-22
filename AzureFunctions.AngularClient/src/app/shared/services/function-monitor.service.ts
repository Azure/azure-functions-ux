import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import {PortalService} from './portal.service';
import {UserService} from './user.service';
import {FunctionsService} from '../services/functions.service';
import {GlobalStateService} from '../services/global-state.service';
import {FunctionInvocations, FunctionInvocationDetails, FunctionAggregates} from '../models/function-monitor'
import {Observable} from 'rxjs/Rx';

@Injectable()
export class FunctionMonitorService {
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

    getDataForSelectedFunction(funcName: string, host: string) {
        var url = this._functionsService.getScmUrl() + "/azurejobs/api/functions/definitions?host=" + host + "&limit=11";
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(this._globalStateService.ScmCreds)
        })
            .map<FunctionAggregates>(r => r.json().entries.find(x => x.functionName.toLowerCase() === funcName.toLowerCase()));
    }


    getInvocationsDataForSelctedFunction(functionId: string) {
        var url = this._functionsService.getScmUrl() + "/azurejobs/api/functions/definitions/" + functionId + "/invocations?limit=20";
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(this._globalStateService.ScmCreds)
        })
            .map<FunctionInvocations[]>(r => r.json().entries)
            .catch(e => Observable.of([]))
    }

    getInvocationDetailsForSelectedInvocation(invocationId: string) {
        var url = this._functionsService.getScmUrl() + "/azurejobs/api/functions/invocations/" + invocationId;
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(this._globalStateService.ScmCreds)
        })
            .map<any>(r => r.json())
            .catch(e => Observable.of(null));
    }

    getOutputDetailsForSelectedInvocation(invocationId: string) {
        var url = this._functionsService.getScmUrl() + "/azurejobs/api/log/output/" + invocationId;
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(this._globalStateService.ScmCreds)
        })
            .map<string>(r => r.text())
            .catch(e => Observable.of(""))
    }
}