import { Injector } from '@angular/core/src/core';
import { Kinds, Links, Pricing } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';

export abstract class StandardPlanPriceSpec extends PriceSpec {
  tier = Tier.standard;
  upsellEnabled = true;

  featureItems = [
    {
      iconUrl: 'image/ssl.svg',
      title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
      description: this._ts.instant(PortalResources.pricing_customDomainsIpSslDesc),
    },
    {
      iconUrl: 'image/scale-up.svg',
      title: this._ts.instant(PortalResources.pricing_autoScale),
      description: this._ts.instant(PortalResources.pricing_scaleDesc).format(10),
    },
    {
      iconUrl: 'image/slots.svg',
      title: this._ts.instant(PortalResources.pricing_stagingSlots),
      description: this._ts.instant(PortalResources.pricing_slotsDesc).format(5),
    },
    {
      iconUrl: 'image/backups.svg',
      title: this._ts.instant(PortalResources.pricing_dailyBackups),
      description: this._ts.instant(PortalResources.pricing_dailyBackupDesc).format(10),
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
      description: this._ts.instant(PortalResources.pricing_sharedDisk).format('50 GB'),
    },
  ];

  cssClass = 'spec standard-spec';

  constructor(injector: Injector) {
    super(injector);
  }

  runInitialization(input: PriceSpecInput) {
    if (input.plan) {
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.hyperV ||
        AppKind.hasAnyKind(input.plan, [Kinds.elastic])
      ) {
        this.state = 'hidden';
      }
    } else if (input.specPickerInput.data) {
      if (
        input.specPickerInput.data.hostingEnvironmentName ||
        input.specPickerInput.data.isXenon ||
        input.specPickerInput.data.hyperV ||
        (input.specPickerInput.data.isNewFunctionAppCreate && input.specPickerInput.data.isElastic)
      ) {
        this.state = 'hidden';
      }
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}

export class StandardSmallPlanPriceSpec extends StandardPlanPriceSpec {
  skuCode = SkuCode.Standard.S1;
  legacySkuName = 'small_standard';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('100'),
    this._ts.instant(PortalResources.pricing_memory).format('1.75'),
    this._ts.instant(PortalResources.pricing_aSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Standard Small App Service Hours';

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

export class StandardMediumPlanPriceSpec extends StandardPlanPriceSpec {
  skuCode = SkuCode.Standard.S2;
  legacySkuName = 'medium_standard';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('200'),
    this._ts.instant(PortalResources.pricing_memory).format('3.5'),
    this._ts.instant(PortalResources.pricing_aSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Standard Medium App Service Hours';

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

  getUpsellSpecSkuCode(): string {
    return SkuCode.PremiumV2.P1V2;
  }
}

export class StandardLargePlanPriceSpec extends StandardPlanPriceSpec {
  skuCode = SkuCode.Standard.S3;
  legacySkuName = 'large_standard';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('400'),
    this._ts.instant(PortalResources.pricing_memory).format('7'),
    this._ts.instant(PortalResources.pricing_aSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Standard Large App Service Hours';

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

  getUpsellSpecSkuCode(): string {
    return SkuCode.PremiumV2.P2V2;
  }
}
