import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import {PortalService} from './portal.service';
import {UserService} from './user.service';
import {FunctionsService} from '../services/functions.service';
import {GlobalStateService} from '../services/global-state.service';
import {FunctionInvocations, FunctionInvocationDetails, FunctionAggregates, FunctionStats} from '../models/function-monitor';
import {Observable} from 'rxjs/Rx';
import {FunctionInfo} from '../models/function-info';
import {FunctionApp} from '../function-app';

@Injectable()
export class FunctionMonitorService {
    private token: string;

    constructor(
        private _userService: UserService,
        private _http: Http,
        private _globalStateService: GlobalStateService
    ) {
        if (!this._globalStateService.showTryView) {
            this._userService.getStartupInfo().subscribe(info => this.token = info.token);
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

    getDataForSelectedFunction(functionInfo : FunctionInfo, host: string) {
        var url = functionInfo.functionApp.getScmUrl() + "/azurejobs/api/functions/definitions?host=" + host + "&limit=11";
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(functionInfo.functionApp.tryFunctionsScmCreds)
        })
        .map(r => <FunctionAggregates>(r.json().entries.find(x => x.functionName.toLowerCase() === functionInfo.name.toLowerCase())));
    }


    getInvocationsDataForSelectedFunction(functionApp : FunctionApp, functionId: string) {
        var url = functionApp.getScmUrl() + "/azurejobs/api/functions/definitions/" + functionId + "/invocations?limit=20";
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(functionApp.tryFunctionsScmCreds)
        })
            .map(r => <FunctionInvocations[]>r.json().entries)
            .catch(e => Observable.of([]))
    }

    getInvocationDetailsForSelectedInvocation(functionApp : FunctionApp, invocationId: string) {
        var url = functionApp.getScmUrl() + "/azurejobs/api/functions/invocations/" + invocationId;
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(functionApp.tryFunctionsScmCreds)
        })
            .map(r => r.json())
            .catch(e => Observable.of(null));
    }

    getOutputDetailsForSelectedInvocation(functionApp : FunctionApp, invocationId: string) {
        var url = functionApp.getScmUrl() + "/azurejobs/api/log/output/" + invocationId;
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(functionApp.tryFunctionsScmCreds)
        })
            .map(r => r.text())
            .catch(e => Observable.of(""))
    }
}
