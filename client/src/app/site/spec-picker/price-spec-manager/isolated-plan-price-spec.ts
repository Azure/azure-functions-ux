import { Injector } from '@angular/core';
import { Kinds, Links, Pricing } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from '../../../shared/models/portal-resources';
import { AseService } from '../../../shared/services/ase.service';
import { NationalCloudEnvironment } from './../../../shared/services/scenario/national-cloud.environment';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';

export abstract class IsolatedPlanPriceSpec extends PriceSpec {
  tier = Tier.isolated;

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

  constructor(injector: Injector) {
    super(injector);

    this._aseService = injector.get(AseService);
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
          // the back-end if it's ASE v1, but at least we allow real ASE v2/v3 customers who don't have
          // ASE permissions to scale their plan.
          if (
            r.isSuccessful &&
            r.result.kind &&
            r.result.kind.toLowerCase().indexOf(Kinds.aseV2.toLowerCase()) === -1 &&
            r.result.kind.toLowerCase().indexOf(Kinds.aseV3.toLowerCase()) === -1
          ) {
            this.state = 'hidden';
          }
        });
      }
    } else if (
      input.specPickerInput.data &&
      (!input.specPickerInput.data.allowAseV2Creation ||
        input.specPickerInput.data.isXenon ||
        input.specPickerInput.data.hyperV ||
        (input.specPickerInput.data.isNewFunctionAppCreate && input.specPickerInput.data.isElastic))
    ) {
      this.state = 'hidden';
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}

export class IsolatedSmallPlanPriceSpec extends IsolatedPlanPriceSpec {
  skuCode = SkuCode.Isolated.I1;
  legacySkuName = 'small_isolated';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('210'),
    this._ts.instant(PortalResources.pricing_memory).format('3.5'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Isolated Small App Service Hours';

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

export class IsolatedMediumPlanPriceSpec extends IsolatedPlanPriceSpec {
  skuCode = SkuCode.Isolated.I2;
  legacySkuName = 'medium_isolated';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('420'),
    this._ts.instant(PortalResources.pricing_memory).format('7'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Isolated Medium App Service Hours';

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

export class IsolatedLargePlanPriceSpec extends IsolatedPlanPriceSpec {
  skuCode = SkuCode.Isolated.I3;
  legacySkuName = 'large_isolated';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('840'),
    this._ts.instant(PortalResources.pricing_memory).format('14'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Isolated Large App Service Hours';

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
