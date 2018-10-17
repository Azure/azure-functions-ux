import { Injectable, Injector } from '@angular/core';
import { ConditionalHttpClient, Result } from '../conditional-http-client';
import { UserService } from './user.service';
import { CacheService } from './cache.service';
import { ResourceId, ArmObj } from '../models/arm/arm-obj';
import { HostingEnvironment } from '../models/arm/hosting-environment';

export interface IAseService {
  getAse(resourceId: ResourceId): Result<ArmObj<HostingEnvironment>>;
}

@Injectable()
export class AseService implements IAseService {
  private readonly _client: ConditionalHttpClient;

  constructor(userService: UserService, injector: Injector, private _cacheService: CacheService) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  getAse(resourceId: ResourceId): Result<ArmObj<HostingEnvironment>> {
    const getPlan = this._cacheService.getArm(resourceId).map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => getPlan);
  }
}
