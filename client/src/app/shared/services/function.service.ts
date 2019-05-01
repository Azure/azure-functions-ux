import { FunctionKeys, FunctionKey } from 'app/shared/models/function-key';
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
    const getFunction = this._cacheService.getArm(`${resourceId}/functions/${functionName}`, false).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getFunction);
  }

  getFunctionKeys(resourceId: string, functionName: string, force?: boolean): Result<FunctionKeys> {
    const getFunctionKeys = this._cacheService.postArm(`${resourceId}/functions/${functionName}/listkeys`, force).map(r => {
      const functionKeys: FunctionKey[] = [];
      const objectKeys = Object.keys(r.json());
      objectKeys.forEach(objectKey => {
        functionKeys.push({ name: objectKey, value: r.json()[objectKey] });
      });
      return { keys: functionKeys };
    });

    return this._client.execute({ resourceId: resourceId }, t => getFunctionKeys);
  }

  createFunctionKey(resourceId: string, functionName: string, newKeyName: string, newKeyValue: string): Result<ArmObj<FunctionKey>> {
    const payload = JSON.stringify({
      properties: {
        name: newKeyName,
        value: newKeyValue,
      },
    });

    const createFunctionKey = this._cacheService
      .putArm(`${resourceId}/functions/${functionName}/keys/${newKeyName}`, null, payload)
      .map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => createFunctionKey);
  }

  deleteFunctionKey(resourceId: string, functionName: string, keyName: string): Result<Response> {
    const deleteFunctionKey = this._cacheService.deleteArm(`${resourceId}/functions/${functionName}/keys/${keyName}`).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => deleteFunctionKey);
  }
}
