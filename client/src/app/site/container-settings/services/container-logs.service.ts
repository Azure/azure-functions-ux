import { Injectable, Injector } from '@angular/core';
import { CacheService } from '../../../shared/services/cache.service';
import { UserService } from '../../../shared/services/user.service';
import { ConditionalHttpClient, Result } from '../../../shared/conditional-http-client';

export interface IContainerLogsService {
  getContainerLogs(resourceId: string): Result<string>;
}

@Injectable()
export class ContainerLogsService implements IContainerLogsService {
  private readonly _client: ConditionalHttpClient;

  constructor(private _cacheService: CacheService, userService: UserService, injector: Injector) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  public getContainerLogs(resourceId: string, force: boolean = false): Result<any> {
    const requestResourceId = `${resourceId}/containerLogs`;

    const getContainerLogs = this._cacheService.postArm(requestResourceId, force).map(r => r, { type: 'application/octet-stream' });

    return this._client.execute({ resourceId: resourceId }, t => getContainerLogs);
  }
}
