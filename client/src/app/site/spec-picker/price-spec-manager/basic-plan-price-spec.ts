import { Kinds, Links, Pricing } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';

export abstract class BasicPlanPriceSpec extends PriceSpec {
  tier = Tier.basic;

  featureItems = [
    {
      iconUrl: 'image/ssl.svg',
      title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
      description: this._ts.instant(PortalResources.pricing_customDomainsSslDesc),
    },
    {
      iconUrl: 'image/scale-up.svg',
      title: this._ts.instant(PortalResources.pricing_manualScale),
      description: this._ts.instant(PortalResources.pricing_scaleDesc).format(3),
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
      description: this._ts.instant(PortalResources.pricing_sharedDisk).format('10 GB'),
    },
  ];

  cssClass = 'spec basic-spec';

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

export class BasicSmallPlanPriceSpec extends BasicPlanPriceSpec {
  skuCode = SkuCode.Basic.B1;
  legacySkuName = 'small_basic';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('100'),
    this._ts.instant(PortalResources.pricing_memory).format('1.75'),
    this._ts.instant(PortalResources.pricing_aSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Basic Small App Service Hours';

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

export class BasicMediumPlanPriceSpec extends BasicPlanPriceSpec {
  skuCode = SkuCode.Basic.B2;
  legacySkuName = 'medium_basic';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('200'),
    this._ts.instant(PortalResources.pricing_memory).format('3.5'),
    this._ts.instant(PortalResources.pricing_aSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Basic Medium App Service Hours';

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

export class BasicLargePlanPriceSpec extends BasicPlanPriceSpec {
  skuCode = SkuCode.Basic.B3;
  legacySkuName = 'large_basic';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('400'),
    this._ts.instant(PortalResources.pricing_memory).format('7'),
    this._ts.instant(PortalResources.pricing_aSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Basic Large App Service Hours';

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
