import { Injector } from '@angular/core';
import { Kinds, Links, Pricing } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { ServerFarm } from './../../../shared/models/server-farm';
import { Sku, ArmObj } from '../../../shared/models/arm/arm-obj';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { DV2SeriesPriceSpec } from './dV2series-price-spec';
import { PlanSpecPickerData } from './plan-price-spec-manager';

export abstract class ElasticPremiumPlanPriceSpec extends DV2SeriesPriceSpec {
  tier = Tier.elasticPremium;

  featureItems = [
    {
      iconUrl: 'image/scale-up.svg',
      title: this._ts.instant(PortalResources.pricing_rapidScale),
      description: this._ts.instant(PortalResources.pricing_rapidScaleDesc),
    },
    {
      iconUrl: 'image/networking.svg',
      title: this._ts.instant(PortalResources.pricing_virtualNetwork),
      description: this._ts.instant(PortalResources.pricing_virtualNetworkDesc),
    },
    {
      iconUrl: 'image/slots.svg',
      title: this._ts.instant(PortalResources.pricing_highDensity),
      description: this._ts.instant(PortalResources.pricing_highDensityDesc),
    },
    {
      iconUrl: 'image/ssl.svg',
      title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
      description: this._ts.instant(PortalResources.pricing_customDomainsIpSslDesc),
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
  ];

  cssClass = 'spec premium-spec';
  priceIsBaseline = true;

  constructor(injector: Injector) {
    super(injector, Tier.elasticPremium, PortalResources.pricing_epNotAvailable, Links.elasticPremiumNotAvailableLearnMore);
  }

  protected _matchSku(sku: Sku): boolean {
    return sku.name.toLowerCase().startsWith('ep');
  }

  protected _shouldHideForNewPlan(data: PlanSpecPickerData): boolean {
    return (
      !!data.hostingEnvironmentName ||
      data.isXenon ||
      data.hyperV ||
      !data.isFunctionApp ||
      (data.isNewFunctionAppCreate && !data.isElastic)
    );
  }

  protected _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean {
    return !!plan.properties.hostingEnvironmentProfile || plan.properties.hyperV || !AppKind.hasAnyKind(plan, [Kinds.elastic]);
  }
}

export class ElasticPremiumSmallPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  private readonly _ep1CpuCore = 1;
  private readonly _ep1Memory = 3.5;
  skuCode = SkuCode.ElasticPremium.EP1;
  legacySkuName = 'small_elastic_premium';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('210'),
    this._ts.instant(PortalResources.pricing_memory).format('3.5'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Premium V2 Small App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: SkuCode.ElasticPremium.EPCPU,
        quantity: (Pricing.secondsInAzureMonth * this._ep1CpuCore) / 100,
        resourceId: null,
      },
      {
        id: SkuCode.ElasticPremium.EPMemory,
        quantity: (Pricing.secondsInAzureMonth * this._ep1Memory) / 100,
        resourceId: null,
      },
    ],
  };
}

export class ElasticPremiumMediumPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  private readonly _ep2CpuCore = 2;
  private readonly _ep2Memory = 7;
  skuCode = SkuCode.ElasticPremium.EP2;
  legacySkuName = 'medium_elastic_premium';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('420'),
    this._ts.instant(PortalResources.pricing_memory).format('7'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Premium V2 Medium App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: SkuCode.ElasticPremium.EPCPU,
        quantity: (Pricing.secondsInAzureMonth * this._ep2CpuCore) / 100,
        resourceId: null,
      },
      {
        id: SkuCode.ElasticPremium.EPMemory,
        quantity: (Pricing.secondsInAzureMonth * this._ep2Memory) / 100,
        resourceId: null,
      },
    ],
  };
}

export class ElasticPremiumLargePlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  private readonly _ep3CpuCore = 4;
  private readonly _ep3Memory = 14;
  skuCode = SkuCode.ElasticPremium.EP3;
  legacySkuName = 'large_elastic_premium';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('840'),
    this._ts.instant(PortalResources.pricing_memory).format('14'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Premium V2 Large App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: SkuCode.ElasticPremium.EPCPU,
        quantity: (Pricing.secondsInAzureMonth * this._ep3CpuCore) / 100,
        resourceId: null,
      },
      {
        id: SkuCode.ElasticPremium.EPMemory,
        quantity: (Pricing.secondsInAzureMonth * this._ep3Memory) / 100,
        resourceId: null,
      },
    ],
  };
}
