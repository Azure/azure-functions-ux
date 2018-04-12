// import { ArmService } from './arm.service';
import { Injectable, Injector } from '@angular/core';
import { ConditionalHttpClient } from '../conditional-http-client';
import { UserService } from './user.service';
import { CacheService } from './cache.service';
import { ResourceId, ArmObj } from '../models/arm/arm-obj';
import { Observable } from 'rxjs/Observable';
import { HttpResult } from '../models/http-result';
import { HostingEnvironment } from '../models/arm/hosting-environment';

type Result<T> = Observable<HttpResult<T>>;

@Injectable()
export class AseService {
    private readonly _client: ConditionalHttpClient;

    constructor(
        userService: UserService,
        injector: Injector,
        private _cacheService: CacheService) {
        this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
    }

    getAse(resourceId: ResourceId): Result<ArmObj<HostingEnvironment>> {
        const getPlan = this._cacheService.getArm(resourceId).map(r => r.json());
        return this._client.execute({ resourceId: resourceId }, t => getPlan);
    }
}
