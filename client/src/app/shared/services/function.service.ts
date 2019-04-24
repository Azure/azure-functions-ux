import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConditionalHttpClient } from './../../shared/conditional-http-client';
import { HttpResult } from './../models/http-result';
import { ArmArrayResult, ArmObj } from './../models/arm/arm-obj';
import { CacheService } from './cache.service';
import { UserService } from './user.service';
import { FunctionInfo } from '../models/function-info';

type Result<T> = Observable<HttpResult<T>>;

@Injectable()
export class FunctionService {
  private readonly _client: ConditionalHttpClient;

  constructor(userService: UserService, injector: Injector, private _cacheService: CacheService) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  getFunctions(resourceId: string): Result<ArmArrayResult<FunctionInfo>> {
    const getFunctions = this._cacheService.getArm(`${resourceId}/functions`, false).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getFunctions);
  }

  getFunction(resourceId: string, functionName: string): Result<ArmObj<FunctionInfo>> {
    const getFunctions = this._cacheService.getArm(`${resourceId}/functions/${functionName}`, false).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getFunctions);
  }
}
