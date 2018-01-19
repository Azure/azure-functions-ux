import { Http, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { UserService } from './user.service';
import { GlobalStateService } from '../services/global-state.service';
import { FunctionInvocations, FunctionAggregates } from '../models/function-monitor';
import { FunctionInfo } from '../models/function-info';
import { FunctionAppContext } from 'app/shared/function-app-context';

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
        const contentType = 'application/json';
        const headers = new Headers();
        headers.append('Content-Type', contentType);

        if (scmCreds) {
            headers.append('Authorization', `Basic ${scmCreds}`);
        } else if (this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }

        return headers;
    }

    getDataForSelectedFunction(context: FunctionAppContext, functionInfo: FunctionInfo, host: string) {
        const url = context.scmUrl + '/azurejobs/api/functions/definitions?host=' + host + '&limit=11';
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(context.tryFunctionsScmCreds)
        })
            .map(r => <FunctionAggregates>(r.json().entries.find(x => x.functionName.toLowerCase() === functionInfo.name.toLowerCase())));
    }

    getInvocationsDataForSelectedFunction(context: FunctionAppContext, functionId: string) {
        const url = context.scmUrl + '/azurejobs/api/functions/definitions/' + functionId + '/invocations?limit=20';
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(context.tryFunctionsScmCreds)
        })
            .map(r => <FunctionInvocations[]>r.json().entries)
            .catch(() => Observable.of([]))
    }

    getInvocationDetailsForSelectedInvocation(context: FunctionAppContext, invocationId: string) {
        const url = context.scmUrl + '/azurejobs/api/functions/invocations/' + invocationId;
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(context.tryFunctionsScmCreds)
        })
            .map(r => r.json())
            .catch(() => Observable.of(null));
    }

    getOutputDetailsForSelectedInvocation(context: FunctionAppContext, invocationId: string) {
        const url = context.scmUrl + '/azurejobs/api/log/output/' + invocationId;
        return this._http.get(url, {
            headers: this.getHeadersForScmSite(context.tryFunctionsScmCreds)
        })
            .map(r => r.text())
            .catch(() => Observable.of(''));
    }
}
