import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { LogCategories } from './../../../shared/models/constants';
import { ServerFarm } from './../../../shared/models/server-farm';
import { ArmObj, ResourceId, Sku } from '../../../shared/models/arm/arm-obj';
import { PlanService } from './../../../shared/services/plan.service';
import { PlanSpecPickerData } from './plan-price-spec-manager';
import { PriceSpec, PriceSpecInput } from './price-spec';

export abstract class DV2SeriesPriceSpec extends PriceSpec {
  private readonly _sku: string;
  private readonly _skuNotAvailableMessage: string;
  private readonly _skuNotAvailableLink: string;
  private _planService: PlanService;

  constructor(injector: Injector, sku: string, skuNotAvailableMessage: string, skuNotAvailableLink: string) {
    super(injector);
    this._planService = injector.get(PlanService);
    this._sku = sku;
    this._skuNotAvailableMessage = this._ts.instant(skuNotAvailableMessage);
    this._skuNotAvailableLink = skuNotAvailableLink;
  }

  protected abstract _matchSku(sku: Sku): boolean;
  protected abstract _shouldHideForNewPlan(data: PlanSpecPickerData): boolean;
  protected abstract _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>, containsJbossSite: boolean): boolean;

  private _checkIfSkuEnabledOnStamp(resourceId: ResourceId) {
    if (this.state !== 'hidden') {
      return this._planService.getAvailableSkusForPlan(resourceId).do(availableSkus => {
        this.state = availableSkus.find(s => this._matchSku(s.sku)) ? 'enabled' : 'disabled';

        if (this.state === 'disabled') {
          this.disabledMessage = this._skuNotAvailableMessage;
          this.disabledInfoLink = this._skuNotAvailableLink;
        }
      });
    }

    return Observable.of(null);
  }

  private _checkIfSkuEnabledInRegion(subscriptionId: ResourceId, location: string, isLinux: boolean, isXenonWorkersEnabled: boolean) {
    if (this.state !== 'hidden' && this.state !== 'disabled') {
      return this._planService
        .getAvailableGeoRegionsForSku(subscriptionId, this._sku, isLinux, isXenonWorkersEnabled)
        .do(geoRegions => {
          if (!geoRegions.find(g => g.properties.name.toLowerCase() === location.toLowerCase())) {
            this.state = 'disabled';
            this.disabledMessage = this._skuNotAvailableMessage;
            this.disabledInfoLink = this._skuNotAvailableLink;
          }
        })
        .catch(e => {
          this.skuAvailabilityCheckFailed = true;
          this._logService.error(
            LogCategories.specPicker,
            '/get-available-georegions-for-sku',
            `Failed to get available georegions for sku: ${e}`
          );
          return Observable.of(null);
        });
    }

    return Observable.of(null);
  }

  runInitialization(input: PriceSpecInput) {
    if (input.planDetails) {
      this.state = this._shouldHideForExistingPlan(input.planDetails.plan, input.planDetails.containsJbossSite) ? 'hidden' : this.state;

      return this._checkIfSkuEnabledOnStamp(input.planDetails.plan.id).switchMap(_ => {
        return this.checkIfDreamspark(input.subscriptionId);
      });
    } else if (input.specPickerInput.data) {
      this.state = this._shouldHideForNewPlan(input.specPickerInput.data) ? 'hidden' : this.state;

      return this.checkIfDreamspark(input.subscriptionId).switchMap(_ => {
        return this._checkIfSkuEnabledInRegion(
          input.subscriptionId,
          input.specPickerInput.data.location,
          input.specPickerInput.data.isLinux,
          false
        );
      });
    }

    return Observable.of(null);
  }
}
