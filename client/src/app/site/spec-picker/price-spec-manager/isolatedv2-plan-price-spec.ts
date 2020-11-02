import { Injector } from '@angular/core';
import { Kinds, Links, Pricing } from '../../../shared/models/constants';
import { Tier, SkuCode } from '../../../shared/models/serverFarmSku';
import { PortalResources } from '../../../shared/models/portal-resources';
import { AseService } from '../../../shared/services/ase.service';
import { NationalCloudEnvironment } from '../../../shared/services/scenario/national-cloud.environment';
import { AppKind } from '../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { PlanService } from './../../../shared/services/plan.service';
import { ResourceId, Sku } from '../../../shared/models/arm/arm-obj';
import { Observable } from 'rxjs/Rx';

export abstract class IsolatedV2PlanPriceSpec extends PriceSpec {
  tier = Tier.isolatedV2;

  featureItems = [
    {
      iconUrl: 'image/app-service-environment.svg',
      title: this._ts.instant(PortalResources.pricing_ase),
      description: this._ts.instant(PortalResources.pricing_aseDesc),
    },
    {
      iconUrl: 'image/networking.svg',
      title: this._ts.instant(PortalResources.pricing_isolatedNetwork),
      description: this._ts.instant(PortalResources.pricing_isolatedNetworkDesc),
    },
    {
      iconUrl: 'image/active-directory.svg',
      title: this._ts.instant(PortalResources.pricing_privateAppAccess),
      description: this._ts.instant(PortalResources.pricing_privateAppAccessDesc),
    },
    {
      iconUrl: 'image/scale-up.svg',
      title: this._ts.instant(PortalResources.pricing_largeScale),
      description: this._ts.instant(PortalResources.pricing_largeScaleDesc),
    },
    {
      iconUrl: 'image/globe.svg',
      title: this._ts.instant(PortalResources.pricing_trafficManager),
      description: this._ts.instant(PortalResources.pricing_trafficManagerDesc),
    },
  ];

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
      description: this._ts.instant(PortalResources.pricing_dedicatedMemory),
    },
    {
      iconUrl: 'image/storage.svg',
      title: this._ts.instant(PortalResources.storage),
      description: this._ts.instant(PortalResources.pricing_sharedDisk).format('1 TB'),
    },
  ];

  cssClass = 'spec isolated-spec';

  private _aseService: AseService;
  private _planService: PlanService;

  constructor(injector: Injector) {
    super(injector);

    this._aseService = injector.get(AseService);
    this._planService = injector.get(PlanService);
  }

  protected _matchSku(sku: Sku): boolean {
    return sku.tier.toLocaleLowerCase() === this.tier.toLocaleLowerCase() && sku.name.indexOf('v2') > -1;
  }

  private _checkIfSkuEnabledOnStamp(resourceId: ResourceId) {
    if (this.state !== 'hidden') {
      return this._planService.getAvailableSkusForPlan(resourceId).do(availableSkus => {
        this.state = availableSkus.find(s => this._matchSku(s.sku)) ? 'enabled' : 'disabled';

        if (this.state === 'disabled') {
          this.disabledMessage = this._ts.instant(PortalResources.pricing_iv2NotAvailable);
          this.disabledInfoLink = ''; // TODO(shimedh): Get link from Christina.
        }
      });
    }

    return Observable.of(null);
  }

  runInitialization(input: PriceSpecInput) {
    if (NationalCloudEnvironment.isBlackforest()) {
      this.state = 'hidden';
    } else if (input.plan) {
      if (
        !input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.hyperV ||
        AppKind.hasAnyKind(input.plan, [Kinds.elastic])
      ) {
        this.state = 'hidden';
      } else {
        return this._aseService.getAse(input.plan.properties.hostingEnvironmentProfile.id).do(r => {
          // If the call to get the ASE fails (maybe due to RBAC), then we can't confirm ASE v1 or v2 or v3
          // but we'll let them see the isolated card anyway.  The plan update will probably fail in
          // the back-end if it's ASE v1, but at least we allow real ASE v3 customers who don't have
          // ASE permissions to scale their plan.
          if (r.isSuccessful && r.result.kind && r.result.kind.toLowerCase().indexOf(Kinds.aseV3.toLowerCase()) === -1) {
            this.state = 'hidden';
          }
        });
      }

      return this._checkIfSkuEnabledOnStamp(input.plan.id).switchMap(_ => {
        return this.checkIfDreamspark(input.subscriptionId);
      });
    } else if (
      input.specPickerInput.data &&
      (!input.specPickerInput.data.allowAseV3Creation ||
        input.specPickerInput.data.isXenon ||
        input.specPickerInput.data.hyperV ||
        (input.specPickerInput.data.isNewFunctionAppCreate && input.specPickerInput.data.isElastic))
    ) {
      this.state = 'hidden';
      return this.checkIfDreamspark(input.subscriptionId);
    }

    return Observable.of(null);
  }
}

export class IsolatedV2SmallPlanPriceSpec extends IsolatedV2PlanPriceSpec {
  skuCode = SkuCode.IsolatedV2.I1V2;
  legacySkuName = SkuCode.IsolatedV2.I1V2;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU_Pv3).format(195),
    this._ts.instant(PortalResources.pricing_memory).format(8),
    this._ts.instant(PortalResources.pricing_vCores).format(2),
  ];

  meterFriendlyName = 'IsolatedV2 Small App Service Hours';

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
}

export class IsolatedV2MediumPlanPriceSpec extends IsolatedV2PlanPriceSpec {
  skuCode = SkuCode.IsolatedV2.I2V2;
  legacySkuName = SkuCode.IsolatedV2.I2V2;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU_Pv3).format(195),
    this._ts.instant(PortalResources.pricing_memory).format(16),
    this._ts.instant(PortalResources.pricing_vCores).format(4),
  ];

  meterFriendlyName = 'IsolatedV2 Medium App Service Hours';

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
}

export class IsolatedV2LargePlanPriceSpec extends IsolatedV2PlanPriceSpec {
  skuCode = SkuCode.IsolatedV2.I3V2;
  legacySkuName = SkuCode.IsolatedV2.I3V2;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU_Pv3).format(195),
    this._ts.instant(PortalResources.pricing_memory).format(32),
    this._ts.instant(PortalResources.pricing_vCores).format(8),
  ];

  meterFriendlyName = 'IsolatedV2 Large App Service Hours';

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
}
