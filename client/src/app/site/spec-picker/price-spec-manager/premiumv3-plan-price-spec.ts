import { Injector } from '@angular/core';
import { Kinds, Links, Pricing, FeatureFlags } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { ServerFarm } from './../../../shared/models/server-farm';
import { Sku, ArmObj } from '../../../shared/models/arm/arm-obj';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { DV3SeriesPriceSpec } from './dV3series-price-spec';
import { PlanSpecPickerData, PlanPriceSpecManager } from './plan-price-spec-manager';
import { Url } from '../../../../app/shared/Utilities/url';

export abstract class PremiumV3PlanPriceSpec extends DV3SeriesPriceSpec {
  tier = Tier.premiumV3;

  featureItems = [
    {
      iconUrl: 'image/ssl.svg',
      title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
      description: this._ts.instant(PortalResources.pricing_customDomainsIpSslDesc),
    },
    {
      iconUrl: 'image/scale-up.svg',
      title: this._ts.instant(PortalResources.pricing_autoScale),
      description: this._ts.instant(PortalResources.pricing_scaleDesc).format(30),
    },
    {
      iconUrl: 'image/slots.svg',
      title: this._ts.instant(PortalResources.pricing_stagingSlots),
      description: this._ts.instant(PortalResources.pricing_slotsDesc).format(20),
    },
    {
      iconUrl: 'image/backups.svg',
      title: this._ts.instant(PortalResources.pricing_dailyBackups),
      description: this._ts.instant(PortalResources.pricing_dailyBackupDesc).format(50),
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
      description: this._ts.instant(PortalResources.pricing_sharedDisk).format('250 GB'),
    },
  ];

  cssClass = 'spec premium-spec';

  // TODO(shimedh): Update learnMore link.
  constructor(injector: Injector, public specManager: PlanPriceSpecManager) {
    super(injector, Tier.premiumV3, PortalResources.pricing_pv3NotAvailable, Links.premiumV2NotAvailableLearnMore);
  }

  protected _matchSku(sku: Sku): boolean {
    return sku.name.indexOf('v3') > -1;
  }

  protected _shouldHideForNewPlan(data: PlanSpecPickerData): boolean {
    const enablePv3Skus = Url.getFeatureValue(FeatureFlags.enablePv3Skus) === 'true';
    return !enablePv3Skus || (enablePv3Skus && (!!data.hostingEnvironmentName || (data.isNewFunctionAppCreate && data.isElastic)));
  }

  protected _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean {
    const enablePv3Skus = Url.getFeatureValue(FeatureFlags.enablePv3Skus) === 'true';
    return (
      !enablePv3Skus ||
      (enablePv3Skus &&
        (!!plan.properties.hostingEnvironmentProfile ||
          (plan.properties.hyperV && plan.sku.tier === Tier.premiumContainer) ||
          AppKind.hasAnyKind(plan, [Kinds.elastic])))
    );
  }
}

export class PremiumV3SmallPlanPriceSpec extends PremiumV3PlanPriceSpec {
  skuCode = SkuCode.PremiumV3.P1V3;
  legacySkuName = SkuCode.PremiumV3.P1V3;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU_Pv3).format(195),
    this._ts.instant(PortalResources.pricing_memory).format(8),
    this._ts.instant(PortalResources.pricing_vCores).format(2),
  ];

  meterFriendlyName = 'Premium V3 Small App Service Hours';

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

export class PremiumV3MediumPlanPriceSpec extends PremiumV3PlanPriceSpec {
  skuCode = SkuCode.PremiumV3.P2V3;
  legacySkuName = SkuCode.PremiumV3.P2V3;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU_Pv3).format(195),
    this._ts.instant(PortalResources.pricing_memory).format(16),
    this._ts.instant(PortalResources.pricing_vCores).format(4),
  ];

  meterFriendlyName = 'Premium V2 Medium App Service Hours';

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

export class PremiumV3LargePlanPriceSpec extends PremiumV3PlanPriceSpec {
  skuCode = SkuCode.PremiumV3.P3V3;
  legacySkuName = SkuCode.PremiumV3.P3V3;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU_Pv3).format(195),
    this._ts.instant(PortalResources.pricing_memory).format(32),
    this._ts.instant(PortalResources.pricing_vCores).format(8),
  ];

  meterFriendlyName = 'Premium V3 Large App Service Hours';

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
