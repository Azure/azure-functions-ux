import { Injectable, Injector } from '@angular/core';
import { ConditionalHttpClient, Result } from '../conditional-http-client';
import { CacheService } from './cache.service';
import { UserService } from './user.service';
import { WebAppCreateStack } from '../models/stacks';
import { Constants, ARMApiVersions } from '../models/constants';

@Injectable()
export class RuntimeStackService {
  private readonly _client: ConditionalHttpClient;

  constructor(userService: UserService, injector: Injector, private _cacheService: CacheService) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  public getWebAppGitHubActionStacks(os: 'linux' | 'windows'): Result<WebAppCreateStack[]> {
    const getWebAppGitHubActionStacks = this._cacheService
      .post(
        `${Constants.serviceHost}stacks/webAppGitHubActionStacks?api-version=${ARMApiVersions.stacksApiVersion20200501}&os=${os}`,
        false,
        null,
        null
      )
      .map(r => r.json());

    return this._client.execute({ resourceId: null }, t => getWebAppGitHubActionStacks);
  }
}
