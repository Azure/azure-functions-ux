import { FunctionKeys, FunctionKey, HostKeys } from 'app/shared/models/function-key';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConditionalHttpClient } from './../../shared/conditional-http-client';
import { HttpResult } from './../models/http-result';
import { ArmArrayResult, ArmObj } from './../models/arm/arm-obj';
import { CacheService } from './cache.service';
import { UserService } from './user.service';
import { LogService } from './log.service';
import { FunctionInfo } from '../models/function-info';
import { HostKeyTypes, LogCategories } from '../models/constants';
import { SyncStatus } from '../models/sync-status';

type Result<T> = Observable<HttpResult<T>>;

@Injectable()
export class FunctionService {
  private readonly _client: ConditionalHttpClient;

  constructor(userService: UserService, injector: Injector, private _cacheService: CacheService, private _logService: LogService) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  getFunctions(resourceId: string, force?: boolean): Result<ArmArrayResult<FunctionInfo>> {
    const getFunctions = this._cacheService.getArm(`${resourceId}/functions`, force).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getFunctions);
  }

  getFunction(resourceId: string, functionName: string, force?: boolean): Result<ArmObj<FunctionInfo>> {
    const getFunction = this._cacheService.getArm(`${resourceId}/functions/${functionName}`, force).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getFunction);
  }

  getFunctionKeys(resourceId: string, functionName: string, force?: boolean): Result<FunctionKeys> {
    const getFunctionKeys = this._cacheService.postArm(`${resourceId}/functions/${functionName}/listkeys`, force).map(r => {
      const functionKeys: FunctionKey[] = [];
      const objectKeys = Object.keys(r.json()) || [];
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

  getHostKeys(resourceId: string, force?: boolean): Result<HostKeys> {
    const getHostKeys = this._cacheService.postArm(`${resourceId}/host/default/listkeys`, force).map(r => {
      const hostMasterKey = r.json()[HostKeyTypes.masterKey];

      const hostFunctionKeys: FunctionKey[] = [];
      let objectKeys = Object.keys(r.json()[HostKeyTypes.functionKeys]) || [];
      objectKeys.forEach(objectKey => {
        hostFunctionKeys.push({ name: objectKey, value: r.json()[HostKeyTypes.functionKeys][objectKey] });
      });

      const hostSystemKeys: FunctionKey[] = [];
      objectKeys = Object.keys(r.json()[HostKeyTypes.systemKeys]) || [];
      objectKeys.forEach(objectKey => {
        hostSystemKeys.push({ name: objectKey, value: r.json()[HostKeyTypes.systemKeys][objectKey] });
      });

      return { masterKey: hostMasterKey, functionKeys: { keys: hostFunctionKeys }, systemKeys: { keys: hostSystemKeys } };
    });

    return this._client.execute({ resourceId: resourceId }, t => getHostKeys);
  }

  createHostKey(resourceId: string, newKeyName: string, newKeyValue: string, hostKeyType: HostKeyTypes): Result<ArmObj<FunctionKey>> {
    const payload = JSON.stringify({
      properties: {
        name: newKeyName,
        value: newKeyValue,
      },
    });

    const createHostKey = this._cacheService
      .putArm(`${resourceId}/host/default/${hostKeyType}/${newKeyName}`, null, payload)
      .map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => createHostKey);
  }

  deleteHostKey(resourceId: string, keyName: string, hostKeyType: HostKeyTypes): Result<Response> {
    const deleteHostKey = this._cacheService.deleteArm(`${resourceId}/host/default/${hostKeyType}/${keyName}`).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => deleteHostKey);
  }

  getHostSyncStatus(resourceId: string): Result<SyncStatus> {
    const getHostSyncStatus = this._cacheService.postArm(`${resourceId}/host/default/sync`, true).map(r => r.json());

    return this._client.execute({ resourceId: resourceId }, t => getHostSyncStatus);
  }

  fireSyncTrigger(resourceId: string): void {
    this._cacheService
      .postArm(`${resourceId}/host/default/listsyncstatus`, true)
      .subscribe(
        success => this._logService.verbose(LogCategories.syncTriggers, success),
        error => this._logService.error(LogCategories.syncTriggers, '/sync-triggers-error', error)
      );
  }
}
