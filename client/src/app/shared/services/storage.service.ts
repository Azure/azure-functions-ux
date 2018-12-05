import { Result, ConditionalHttpClient } from '../conditional-http-client';
import { ArmArrayResult, ResourceId } from '../models/arm/arm-obj';
import { StorageAccount, StorageAccountKey, ContainerResult, ShareResult, StorageDirectApiPayload } from '../models/storage-account';
import { Injectable, Injector } from '@angular/core';
import { CacheService } from './cache.service';
import { UserService } from './user.service';
import { ARMApiVersions, Constants } from '../models/constants';

interface IStorageService {
  getAccounts(subscriptionId: string): Result<ArmArrayResult<StorageAccount>>;
  listAccountKeys(resourceId: ResourceId): Result<StorageAccountKey[]>;
  getContainers(accountName: string, accessKey: string): Result<ContainerResult[]>;
  getFileShares(accountName: string, accessKey: string): Result<ShareResult[]>;
}

@Injectable()
export class StorageService implements IStorageService {
  private readonly _client: ConditionalHttpClient;

  constructor(private _cacheService: CacheService, injector: Injector, userService: UserService) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  public getAccounts(subscriptionId: string): Result<ArmArrayResult<StorageAccount>> {
    const id = `/subscriptions/${subscriptionId}/providers/Microsoft.Storage/storageAccounts`;
    const getAccounts = this._cacheService.getArm(id, false, ARMApiVersions.storageApiVersion).map(r => {
      return r.json();
    });
    return this._client.execute({ resourceId: id }, t => getAccounts);
  }

  public listAccountKeys(resourceId: ResourceId): Result<StorageAccountKey[]> {
    const id = `${resourceId}/listKeys`;
    const listAccountKeys = this._cacheService.postArm(id, false, ARMApiVersions.storageApiVersion).map(r => {
      return r.json();
    });
    return this._client.execute({ resourceId: id }, t => listAccountKeys);
  }

  public getContainers(accountName: string, accessKey: string): Result<ContainerResult[]> {
    const payload: StorageDirectApiPayload = {
      accountName,
      accessKey,
    };

    const getContainers = this._cacheService.post(`${Constants.serviceHost}api/getStorageContainers?accountName=${accountName}`, false, null, payload).map(r => r.json());

    return this._client.execute({ resourceId: null }, t => getContainers);
  }

  public getFileShares(accountName: string, accessKey: string): Result<ShareResult[]> {
    const payload: StorageDirectApiPayload = {
      accountName,
      accessKey,
    };

    const getFileShares = this._cacheService.post(`${Constants.serviceHost}api/getStorageFileShares?accountName=${accountName}`, false, null, payload).map(r => r.json());

    return this._client.execute({ resourceId: null }, t => getFileShares);
  }
}
