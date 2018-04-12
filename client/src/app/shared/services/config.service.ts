import { FunctionsVersionInfo } from './../models/functions-version-info';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ConfigService {
    private runtimeType = window.appsvc.env.runtimeType;

    get FunctionsVersionInfo(): FunctionsVersionInfo {
        return window.appsvc.functionsVersionInfo;
    }

    isOnPrem(): boolean {
        return this.runtimeType === 'OnPrem';
    }

    isAzure(): boolean {
        return this.runtimeType === 'Azure';
    }

    isStandalone(): boolean {
        return this.runtimeType === 'Standalone';
    }
}