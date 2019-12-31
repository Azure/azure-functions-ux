import { Result, ConditionalHttpClient } from '../conditional-http-client';
import { Injectable, Injector } from '@angular/core';
import { CacheService } from './cache.service';
import { UserService } from './user.service';
import { ARMApiVersions } from '../models/constants';
import { Subscription } from '../models/subscription';

@Injectable()
export class SubscriptionService {
  private readonly _client: ConditionalHttpClient;

  constructor(private _cacheService: CacheService, injector: Injector, userService: UserService) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  public getSubscription(subscriptionId: string): Result<Subscription> {
    const resourceId = `/subscriptions/${subscriptionId}`;
    const getSubscription = this._cacheService.getArm(resourceId, false, ARMApiVersions.armApiVersion).map(r => {
      return r.json();
    });

    return this._client.execute({ resourceId }, t => getSubscription);
  }
}
