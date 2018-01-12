import { Http, Headers, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';
import 'rxjs/add/observable/of';

import { FunctionsResponse } from './../models/functions-response';
import { FunctionTemplate } from '../models/function-template';
import { DesignerSchema } from '../models/designer-schema';
import { UserService } from './user.service';
import { Constants } from '../models/constants';
import { Cache } from '../decorators/cache.decorator';
import { GlobalStateService } from './global-state.service';
import { UIResource, ITryAppServiceTemplate } from '../models/ui-resource';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Site } from '../models/arm/site';
import { ArmObj } from '../models/arm/arm-obj';

@Injectable()
export class TryFunctionsService {
    private token: string;
    public isEasyAuthEnabled: boolean;
    public selectedFunction: string;
    public selectedLanguage: string;
    public selectedProvider: string;
    public selectedFunctionName: string;

    public isMultiKeySupported = true;

    private tryAppServiceUrl = 'https://tryappservice.azure.com';
    public functionContainer: ArmObj<Site>;

    constructor(private _http: Http,
        private _userService: UserService,
        private _globalStateService: GlobalStateService) {

        if (!_globalStateService.showTryView) {
            this._userService.getStartupInfo().subscribe(info => { this.token = info.token });
        }

        if (Cookie.get('TryAppServiceToken')) {
            this._globalStateService.TryAppServiceToken = Cookie.get('TryAppServiceToken');
            const templateId = Cookie.get('templateId');
            this.selectedFunction = templateId.split('-')[0].trim();
            this.selectedLanguage = templateId.split('-')[1].trim();
            this.selectedProvider = Cookie.get('provider');
            this.selectedFunctionName = Cookie.get('functionName');
        }
    }

    // This function is special cased in the Cache() decorator by name to allow for dev scenarios.
    @Cache()
    getTemplates() {
        try {
            if (localStorage.getItem('dev-templates')) {
                const devTemplate: FunctionTemplate[] = JSON.parse(localStorage.getItem('dev-templates'));
                // this.localize(devTemplate);
                return Observable.of(devTemplate);
            }
        } catch (e) {
            console.error(e);
        }

        let url = `${Constants.serviceHost}api/templates?runtime='latest'`;
        return this._http.get(url, { headers: this.getPortalHeaders() })
            .retryWhen(this.retryAntares)
            .map(r => {
                const object = r.json();
                // this.localize(object);
                return <FunctionTemplate[]>object;
            });
    }

    @Cache()
    getDesignerSchema() {
        return this._http.get('mocks/function-json-schema.json')
            .retryWhen(this.retryAntares)
            .map(r => <DesignerSchema>r.json());
    }

    getTrialResource(provider?: string): Observable<UIResource> {
        const url = this.tryAppServiceUrl + '/api/resource?appServiceName=Function'
            + (provider ? '&provider=' + provider : '');

        return this._http.get(url, { headers: this.getTryAppServiceHeaders() })
            .retryWhen(this.retryGetTrialResource)
            .map(r => <UIResource>r.json());
    }

    createTrialResource(selectedTemplate: FunctionTemplate, provider: string, functionName: string): Observable<UIResource> {
        const url = this.tryAppServiceUrl + '/api/resource?appServiceName=Function'
            + (provider ? '&provider=' + provider : '')
            + '&templateId=' + encodeURIComponent(selectedTemplate.id)
            + '&functionName=' + encodeURIComponent(functionName)
            + '&trial=true';

        const template = <ITryAppServiceTemplate>{
            name: selectedTemplate.id,
            appService: 'Function',
            language: selectedTemplate.metadata.language,
            githubRepo: ''
        };

        return this._http.post(url, JSON.stringify(template), { headers: this.getTryAppServiceHeaders() })
            .retryWhen(this.retryCreateTrialResource)
            .map(r => <UIResource>r.json());
    }

    // to talk to Functions Portal
    private getPortalHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        const headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this.token) {
            headers.append('client-token', this.token);
            headers.append('portal-token', this.token);
        }

        return headers;
    }

    // to talk to TryAppservice
    private getTryAppServiceHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        const headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this._globalStateService.TryAppServiceToken) {
            headers.append('Authorization', `Bearer ${this._globalStateService.TryAppServiceToken}`);
        } else {
            headers.append('ms-x-user-agent', 'Functions/');
        }
        return headers;
    }

    private retryAntares(error: Observable<any>): Observable<any> {
        return error.scan((errorCount: number, err: FunctionsResponse) => {
            if (err.isHandled || err.status < 500 || errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }

    private retryCreateTrialResource(error: Observable<any>): Observable<any> {
        return error.scan((errorCount: number, err: Response) => {
            // 400 => you already have a resource, 403 => No login creds provided
            if (err.status === 400 || err.status === 403 || errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }

    private retryGetTrialResource(error: Observable<any>): Observable<any> {
        return error.scan((errorCount: number, err: Response) => {
            // 403 => No login creds provided
            if (err.status === 403 || errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }
}
