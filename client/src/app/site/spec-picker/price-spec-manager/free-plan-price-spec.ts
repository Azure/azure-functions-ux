import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Kinds, Links } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { ResourceId } from '../../../shared/models/arm/arm-obj';
import { PlanService } from './../../../shared/services/plan.service';
import { Url } from 'app/shared/Utilities/url';

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
      iconUrl: 'image/app-service-plan.svg',
      title: this._ts.instant(PortalResources.pricing_includedHardware_azureComputeUnits),
      description: this._ts.instant(PortalResources.pricing_computeDedicatedAcu),
      learnMoreUrl: Links.azureComputeUnitLearnMore,
    },
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
        quantity: 744,
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
    if (input.plan) {
      isLinux = AppKind.hasAnyKind(input.plan, [Kinds.linux]);
      if (isLinux) {
        this.topLevelFeatures.shift();
      }

      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [Kinds.elastic])
      ) {
        this.state = 'hidden';
      }

      return this._checkIfSkuEnabledOnStamp(input.plan.id).switchMap(_ => {
        return this.checkIfDreamspark(input.subscriptionId);
      });
    } else if (input.specPickerInput.data) {
      isLinux = input.specPickerInput.data.isLinux;
      if (isLinux) {
        this.topLevelFeatures.shift();
      }

      if (input.specPickerInput.data.hostingEnvironmentName || input.specPickerInput.data.isXenon) {
        this.state = 'hidden';
      }

      return this._checkIfSkuEnabledInRegion(input.subscriptionId, input.specPickerInput.data.location, input.specPickerInput.data.isLinux);
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

  private _checkIfSkuEnabledInRegion(subscriptionId: ResourceId, location: string, isLinux: boolean) {
    if (this.state !== 'hidden' && this.state !== 'disabled') {
      return this._planService.getAvailableGeoRegionsForSku(subscriptionId, this.tier, isLinux).do(geoRegions => {
        if (!geoRegions.find(g => g.properties.name.toLowerCase() === location.toLowerCase())) {
          this.state = 'disabled';
          this.disabledMessage = this._ts.instant(PortalResources.pricing_freeLinuxNotAvailable);
          this.disabledInfoLink = '';
        }
      });
    }

    return Observable.of(null);
  }
}
