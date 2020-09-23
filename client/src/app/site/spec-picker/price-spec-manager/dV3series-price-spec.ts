import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ServerFarm } from '../../../shared/models/server-farm';
import { ArmObj, ResourceId, Sku } from '../../../shared/models/arm/arm-obj';
import { PlanService } from '../../../shared/services/plan.service';
import { PlanSpecPickerData } from './plan-price-spec-manager';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { PortalResources } from './../../../shared/models/portal-resources';

export abstract class DV3SeriesPriceSpec extends PriceSpec {
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
  protected abstract _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean;

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

  private _checkIfSkuEnabledInRegion(subscriptionId: ResourceId, location: string, isLinux: boolean, isXenon: boolean) {
    if (this.state !== 'hidden' && this.state !== 'disabled') {
      return this._planService.getAvailableGeoRegionsForSku(subscriptionId, this._sku, isLinux, isXenon).do(geoRegions => {
        if (!geoRegions.find(g => g.properties.name.toLowerCase() === location.toLowerCase())) {
          this.state = 'disabled';
          this.disabledMessage = this._skuNotAvailableMessage;
          this.disabledInfoLink = this._skuNotAvailableLink;
        }
      });
    }

    return Observable.of(null);
  }

  private _updateHardwareItemsList(isHyperV: boolean) {
    if (isHyperV) {
      this.hardwareItems.splice(0, 0, {
        iconUrl: 'image/storage.svg',
        title: this._ts.instant(PortalResources.hyperVIsolation),
        description: this._ts.instant(PortalResources.hyperVIsolationDesc),
      });
    }
  }

  runInitialization(input: PriceSpecInput) {
    if (input.plan) {
      this._updateHardwareItemsList(input.plan.properties.hyperV);
      this.state = this._shouldHideForExistingPlan(input.plan) ? 'hidden' : this.state;

      return this._checkIfSkuEnabledOnStamp(input.plan.id).switchMap(_ => {
        return this.checkIfDreamspark(input.subscriptionId);
      });
    } else if (input.specPickerInput.data) {
      const isXenon = input.specPickerInput.data.hyperV || input.specPickerInput.data.isXenon;
      this._updateHardwareItemsList(isXenon);
      this.state = this._shouldHideForNewPlan(input.specPickerInput.data) ? 'hidden' : this.state;

      return this.checkIfDreamspark(input.subscriptionId).switchMap(_ => {
        return this._checkIfSkuEnabledInRegion(
          input.subscriptionId,
          input.specPickerInput.data.location,
          input.specPickerInput.data.isLinux,
          isXenon
        );
      });
    }

    return Observable.of(null);
  }
}
