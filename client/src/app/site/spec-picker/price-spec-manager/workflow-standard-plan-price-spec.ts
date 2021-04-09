import { Injector } from '@angular/core';
import { Kinds, Links, Pricing } from '../../../shared/models/constants';
import { Tier, SkuCode } from '../../../shared/models/serverFarmSku';
import { PortalResources } from '../../../shared/models/portal-resources';
import { ServerFarm } from '../../../shared/models/server-farm';
import { Sku, ArmObj } from '../../../shared/models/arm/arm-obj';
import { AppKind } from '../../../shared/Utilities/app-kind';
import { DV2SeriesPriceSpec } from './dV2series-price-spec';
import { PlanSpecPickerData } from './plan-price-spec-manager';

export abstract class WorkflowStandardPlanPriceSpec extends DV2SeriesPriceSpec {
  tier = Tier.workflowStandard;

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

  // TODO(shimedh): Will update the learn more link once we get a new one from LA team. Till then using elastic premium one as they are the same under the hood.
  constructor(injector: Injector) {
    super(injector, Tier.workflowStandard, PortalResources.pricing_workflowStandardNotAvailable, Links.elasticPremiumNotAvailableLearnMore);
  }

  protected _matchSku(sku: Sku): boolean {
    return sku.name.toLowerCase().startsWith('ws');
  }

  protected _shouldHideForNewPlan(data: PlanSpecPickerData): boolean {
    return (
      !!data.hostingEnvironmentName ||
      data.isXenon ||
      data.hyperV ||
      !data.isFunctionApp ||
      (data.isNewFunctionAppCreate && !data.isWorkflowStandard)
    );
  }

  // NOTE(shimedh): Plan kind is 'elastic' for both Elastic Premium and Workflow Standard. SO we need to check sku tier as well.
  protected _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean {
    return (
      !!plan.properties.hostingEnvironmentProfile ||
      plan.properties.hyperV ||
      !AppKind.hasAnyKind(plan, [Kinds.elastic]) ||
      plan.sku.tier !== Tier.workflowStandard
    );
  }
}

export class WorkflowStandardSmallPlanPriceSpec extends WorkflowStandardPlanPriceSpec {
  skuCode = SkuCode.WorkflowStandard.WS1;
  legacySkuName = SkuCode.WorkflowStandard.WS1;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('210'),
    this._ts.instant(PortalResources.pricing_memory).format('3.5'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Workflow Standard Small App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: SkuCode.WorkflowStandard.WS1CPU,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
      {
        id: SkuCode.WorkflowStandard.WS1Memory,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };
}

export class WorkflowStandardMediumPlanPriceSpec extends WorkflowStandardPlanPriceSpec {
  skuCode = SkuCode.WorkflowStandard.WS2;
  legacySkuName = SkuCode.WorkflowStandard.WS2;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('420'),
    this._ts.instant(PortalResources.pricing_memory).format('7'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Workflow Standard Medium App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: SkuCode.WorkflowStandard.WS2CPU,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
      {
        id: SkuCode.WorkflowStandard.WS2Memory,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };
}

export class WorkflowStandardLargePlanPriceSpec extends WorkflowStandardPlanPriceSpec {
  skuCode = SkuCode.WorkflowStandard.WS3;
  legacySkuName = SkuCode.WorkflowStandard.WS3;
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_ACU).format('840'),
    this._ts.instant(PortalResources.pricing_memory).format('14'),
    this._ts.instant(PortalResources.pricing_dSeriesComputeEquivalent),
  ];

  meterFriendlyName = 'Workflow Standard Large App Service Hours';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: SkuCode.WorkflowStandard.WS3CPU,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
      {
        id: SkuCode.WorkflowStandard.WS3Memory,
        quantity: Pricing.hoursInAzureMonth,
        resourceId: null,
      },
    ],
  };
}
