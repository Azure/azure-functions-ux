import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Kinds, LogCategories, Pricing } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { ResourceId } from '../../../shared/models/arm/arm-obj';
import { PlanService } from './../../../shared/services/plan.service';

export class FreePlanPriceSpec extends PriceSpec {
  tier = Tier.free;
  skuCode = SkuCode.Free.F1;
  legacySkuName = 'free';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_sharedInfrastructure),
    this._ts.instant(PortalResources.pricing_memory).format(1),
    this._ts.instant(PortalResources.pricing_computeLimit).format(60),
  ];

  featureItems = null;

  hardwareItems = [
    {
      iconUrl: 'image/website-power.svg',
      title: this._ts.instant(PortalResources.memory),
      description: this._ts.instant(PortalResources.pricing_sharedMemory),
    },
    {
      iconUrl: 'image/storage.svg',
      title: this._ts.instant(PortalResources.storage),
      description: this._ts.instant(PortalResources.pricing_sharedDisk).format('1 GB'),
    },
  ];

  meterFriendlyName = 'Free App Service';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: this.skuCode,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };

  cssClass = 'spec free-spec';

  allowZeroCost = true;

  private _planService: PlanService;

  constructor(injector: Injector) {
    super(injector);
    this._planService = injector.get(PlanService);
  }

  runInitialization(input: PriceSpecInput) {
    let isLinux = false;
    if (input.planDetails) {
      isLinux = AppKind.hasAnyKind(input.planDetails.plan, [Kinds.linux]);
      if (isLinux) {
        this.topLevelFeatures.shift();
      }

      if (
        input.planDetails.plan.properties.hostingEnvironmentProfile ||
        input.planDetails.plan.properties.hyperV ||
        AppKind.hasAnyKind(input.planDetails.plan, [Kinds.elastic]) ||
        input.planDetails.containsJbossSite
      ) {
        this.state = 'hidden';
      }

      return this._checkIfSkuEnabledOnStamp(input.planDetails.plan.id);
    } else if (input.specPickerInput.data) {
      isLinux = input.specPickerInput.data.isLinux;
      if (isLinux) {
        this.topLevelFeatures.shift();
      }

      // NOTE(shimedh): FunctionApp's don't work on Free sku's (Linux as well as Windows). Hide Free sku for Linux FunctionApp create scenario.
      if (
        input.specPickerInput.data.isFunctionApp ||
        input.specPickerInput.data.hostingEnvironmentName ||
        input.specPickerInput.data.isXenon ||
        input.specPickerInput.data.hyperV ||
        (input.specPickerInput.data.isNewFunctionAppCreate &&
          (input.specPickerInput.data.isElastic || input.specPickerInput.data.isWorkflowStandard)) ||
        input.specPickerInput.data.isJBoss
      ) {
        this.state = 'hidden';
      }

      return this._checkIfSkuEnabledInRegion(
        input.subscriptionId,
        input.specPickerInput.data.location,
        input.specPickerInput.data.isLinux,
        false
      );
    }

    return Observable.of(null);
  }

  private _checkIfSkuEnabledOnStamp(resourceId: ResourceId) {
    if (this.state !== 'hidden') {
      return this._planService.getAvailableSkusForPlan(resourceId).do(availableSkus => {
        this.state = availableSkus.find(s => s.sku.tier === this.tier) ? 'enabled' : 'disabled';

        if (this.state === 'disabled') {
          this.disabledMessage = this._ts.instant(PortalResources.pricing_freeLinuxNotAvailable);
          this.disabledInfoLink = '';
        }
      });
    }

    return Observable.of(null);
  }

  private _checkIfSkuEnabledInRegion(subscriptionId: ResourceId, location: string, isLinux: boolean, isXenonWorkersEnabled: boolean) {
    if (this.state !== 'hidden' && this.state !== 'disabled') {
      return this._planService
        .getAvailableGeoRegionsForSku(subscriptionId, this.tier, isLinux, isXenonWorkersEnabled)
        .do(geoRegions => {
          if (!geoRegions.find(g => g.properties.name.toLowerCase() === location.toLowerCase())) {
            this.state = 'disabled';
            this.disabledMessage = this._ts.instant(PortalResources.pricing_freeLinuxNotAvailable);
            this.disabledInfoLink = '';
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
}
