import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ConditionalHttpClient } from './../../shared/conditional-http-client';
import { ScenarioService } from 'app/shared/services/scenario/scenario.service';
import { PricingTier } from './../models/arm/PricingTier';
import { CacheService } from './cache.service';
import { UserService } from './user.service';
import { ArmObj } from './../models/arm/arm-obj';
import { ScenarioIds } from './../../shared/models/constants';

@Injectable()
export class PricingTierService {
  private static readonly _pricingTierApiFormat = '/subscriptions/{0}/providers/Microsoft.Web/pricingTiers';
  private readonly _client: ConditionalHttpClient;
  private _usePricingTierApi = false;
  constructor(
    private _userService: UserService,
    private _injector: Injector,
    private _cacheService: CacheService,
    private _scenarioService: ScenarioService
  ) {
    this._client = new ConditionalHttpClient(this._injector, _ => this._userService.getStartupInfo().map(i => i.token));
    this._usePricingTierApi = this._scenarioService.checkScenario(ScenarioIds.usePricingTierApi).status === 'enabled';
  }

  getPricingTiers(subscription: string, force?: boolean): Observable<ArmObj<PricingTier>[]> {
    const resourceId = PricingTierService._pricingTierApiFormat.format(subscription);
    if (!this._usePricingTierApi) {
      return Observable.of(null);
    }
    const pricingTiers = this._cacheService.getArm(resourceId, force).map(r => r.json());
    return this._client.execute({ resourceId: resourceId }, t => pricingTiers).map(r => {
      return r.result.value;
    });
  }
}
