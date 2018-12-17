import { IBillingService } from './billing.service';
import { Observable } from 'rxjs/Observable';
import { Injectable, Injector } from '@angular/core';
import { UserService } from './user.service';
import { PortalService } from './portal.service';
import { ConditionalHttpClient } from '../conditional-http-client';
import { PricingTier } from '../models/arm/pricingtier';
import { CacheService } from './cache.service';
import { ArmArrayResult } from '../models/arm/arm-obj';

export interface IBillingService {
  checkIfSubscriptionHasQuotaId(subscriptionId: string, quotaId: string);
}

@Injectable()
export class BillingService implements IBillingService {
  private static readonly _pricingTierApiFormat = '/subscriptions/{0}/providers/Microsoft.Web/pricingTiers';
  private readonly _client: ConditionalHttpClient;

  constructor(userService: UserService, injector: Injector, private _portalService: PortalService, private _cacheService: CacheService) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  checkIfSubscriptionHasQuotaId(subscriptionId: string, quotaId: string) {
    return this._portalService
      .getSubscription(subscriptionId)
      .map(s => {
        return s && s.subscriptionPolicies && s.subscriptionPolicies.quotaId.toLowerCase() === quotaId.toLowerCase();
      })
      .catch(e => Observable.of(false));
  }

  getPricingTiers(subscription: string, force?: boolean): Observable<ArmArrayResult<PricingTier>> {
    const resourceId = BillingService._pricingTierApiFormat.format(subscription);
    const pricingTiers = this._cacheService.getArm(resourceId, force).map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => pricingTiers).map(r => {
      return r.result;
    });
  }
}
