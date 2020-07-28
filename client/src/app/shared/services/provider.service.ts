import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpResult } from './../models/http-result';
import { ConditionalHttpClient } from '../conditional-http-client';
import { UserService } from './user.service';
import { CacheService } from './cache.service';
import { ArmArrayResult, ArmObj } from '../models/arm/arm-obj';
import { SourceControl } from '../models/arm/provider';

type Result<T> = Observable<HttpResult<T>>;

@Injectable()
export class ProviderService {
    private readonly _client: ConditionalHttpClient;

    constructor(userService: UserService, injector: Injector, private _cacheService: CacheService) {
        this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
    }

    getUserSourceControls(): Result<ArmArrayResult<SourceControl>> {
        const resourceId = 'providers/Microsoft.Web/sourcecontrols';
        const getUserSourceControls = this._cacheService.getArm(resourceId, true).map(r => r.json());
        return this._client.execute({ resourceId: resourceId }, t => getUserSourceControls);
    }

    getUserSourceControl(provider: string): Result<ArmObj<SourceControl>> {
        const resourceId = `providers/Microsoft.Web/sourcecontrols/${provider}`;
        const getUserSourceControl = this._cacheService.getArm(resourceId, true).map(r => r.json());
        return this._client.execute({ resourceId: resourceId }, t => getUserSourceControl);
    }

    updateUserSourceControl(provider: string, token: string, refreshToken?: string, environment?: string) {
        const resourceId = `providers/Microsoft.Web/sourcecontrols/${provider}`;

        const body = {
            id: '',
            location: '',
            name: provider,
            type: 'Microsoft.Web/sourcecontrols',
            properties: {
                token,
                refreshToken,
                environment,
                name: provider
            }
        };

        const putUserSourceControls = this._cacheService.putArm(resourceId, null, body).map(r => r.json);
        return this._client.execute({ resourceId: resourceId }, t => putUserSourceControls);
    }
}