import { Injector } from '@angular/core';
import { Kinds, Links, Pricing } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { ServerFarm } from './../../../shared/models/server-farm';
import { Sku, ArmObj } from '../../../shared/models/arm/arm-obj';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { DV2SeriesPriceSpec } from './dV2series-price-spec';
import { PlanSpecPickerData, PlanPriceSpecManager } from './plan-price-spec-manager';

export abstract class PremiumV2PlanPriceSpec extends DV2SeriesPriceSpec {
  tier = Tier.premiumV2;

  featureItems = [
    {
      iconUrl: 'image/ssl.svg',
      title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
      description: this._ts.instant(PortalResources.pricing_customDomainsIpSslDesc),
    },
    {
      iconUrl: 'image/scale-up.svg',
      title: this._ts.instant(PortalResources.pricing_autoScale),
      description: this._ts.instant(PortalResources.pricing_scaleDesc).format(20),
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

  constructor(injector: Injector, public specManager: PlanPriceSpecManager) {
    super(injector, Tier.premiumV2, PortalResources.pricing_pv2NotAvailable, Links.premiumV2NotAvailableLearnMore);
  }

  protected _matchSku(sku: Sku): boolean {
    return sku.name.indexOf('v2') > -1;
  }

  protected _shouldHideForNewPlan(data: PlanSpecPickerData): boolean {
    return !!data.hostingEnvironmentName || data.isXenon || data.hyperV || (data.isNewFunctionAppCreate && data.isElastic);
  }

  protected _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean {
    return !!plan.properties.hostingEnvironmentProfile || plan.properties.hyperV || AppKind.hasAnyKind(plan, [Kinds.elastic]);
  }

  public updateUpsellBanner(): void {
    this.specManager.selectedSpecGroup.bannerMessage = null;
  }
}

export class PremiumV2SmallPlanPriceSpec extends PremiumV2PlanPriceSpec {
  skuCode = SkuCode.PremiumV2.P1V2;
  legacySkuName = 'D1_premiumV2';
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
        id: this.skuCode,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };
}

export class PremiumV2MediumPlanPriceSpec extends PremiumV2PlanPriceSpec {
  skuCode = SkuCode.PremiumV2.P2V2;
  legacySkuName = 'D2_premiumV2';
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
        id: this.skuCode,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };
}

export class PremiumV2LargePlanPriceSpec extends PremiumV2PlanPriceSpec {
  skuCode = SkuCode.PremiumV2.P3V2;
  legacySkuName = 'D3_premiumV2';
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
        id: this.skuCode,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };
}
