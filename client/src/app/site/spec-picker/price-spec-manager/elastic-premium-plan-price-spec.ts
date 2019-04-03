import { Injector } from '@angular/core';
import { Kinds, Links, FeatureFlags } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { ServerFarm } from './../../../shared/models/server-farm';
import { Sku, ArmObj } from '../../../shared/models/arm/arm-obj';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { DV2SeriesPriceSpec } from './dV2series-price-spec';
import { PlanSpecPickerData } from './plan-price-spec-manager';
import { Url } from 'app/shared/Utilities/url';

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
      description: this._ts.instant(PortalResources.pricing_isolatedNetworkDesc),
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

  constructor(injector: Injector) {
    super(injector, Tier.elasticPremium, PortalResources.pricing_epNotAvailable, Links.elasticPremiumNotAvailableLearnMore);
  }

  protected _matchSku(sku: Sku): boolean {
    return sku.name.toLowerCase().startsWith('ep');
  }

  protected _shouldHideForNewPlan(data: PlanSpecPickerData): boolean {
    const allowLinux = Url.getParameterByName(null, FeatureFlags.EnableLinuxElasticPremium) === 'true';
    return !!data.hostingEnvironmentName || data.isXenon || (data.isLinux && !allowLinux) || !data.isFunctionApp;
  }

  protected _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean {
    return !!plan.properties.hostingEnvironmentProfile || plan.properties.isXenon || !AppKind.hasAnyKind(plan, [Kinds.elastic]);
  }
}

export class ElasticPremiumSmallPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  skuCode = SkuCode.ElasticPremium.EP1;
  billingSkuCode = SkuCode.PremiumV2.P1V2;
  legacySkuName = 'small_elastic_premium';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('210'),
    this._ts.instant(PortalResources.pricing_memory).format('3.5'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Premium V2 Small App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [{ quantity: 744, resourceId: null }],
  };
}

export class ElasticPremiumMediumPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  skuCode = SkuCode.ElasticPremium.EP2;
  billingSkuCode = SkuCode.PremiumV2.P2V2;
  legacySkuName = 'medium_elastic_premium';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('420'),
    this._ts.instant(PortalResources.pricing_memory).format('7'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Premium V2 Medium App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [{ quantity: 744, resourceId: null }],
  };
}

export class ElasticPremiumLargePlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  skuCode = SkuCode.ElasticPremium.EP3;
  billingSkuCode = SkuCode.PremiumV2.P3V2;
  legacySkuName = 'large_elastic_premium';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('840'),
    this._ts.instant(PortalResources.pricing_memory).format('14'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Premium V2 Large App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [{ quantity: 744, resourceId: null }],
  };
}
