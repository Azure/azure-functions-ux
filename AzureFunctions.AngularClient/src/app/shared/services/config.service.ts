﻿import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Constants } from '../models/constants';

@Injectable()
export class ConfigService {
    private azureResourceManagerEndpoint: string;
    private runtimeType: string;

    constructor(private http: Http) {
    }

    loadConfig() {
        var observable = this.http.get(Constants.serviceHost + 'api/config')
            .map((response) => {
                var res = response.json();
                return res;
            });

        return observable.toPromise().then(config => this.setConfig(config));
    }

    setConfig(config: any) {
        this.azureResourceManagerEndpoint = config.AzureResourceManagerEndpoint;
        this.runtimeType = config.RuntimeType;
    }

    getAzureResourceManagerEndpoint() {
        return this.azureResourceManagerEndpoint;
    }

    getRuntimeType() {
        return this.runtimeType;
    }

    isOnPrem(): boolean {
        return this.runtimeType === "OnPrem";
    }

    isAzure(): boolean {
        return this.runtimeType === "Azure";
    }

    isStandalone() : boolean{
        return this.runtimeType === "Standalone";
    }
}