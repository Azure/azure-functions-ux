import { Injector } from '@angular/core/src/core';
import { Kinds, Links, ServerFarmSku } from './../../../shared/models/constants';
import { PortalResources } from './../../../shared/models/portal-resources';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';

export abstract class StandardPlanPriceSpec extends PriceSpec {
  tier = ServerFarmSku.standard;

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
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [Kinds.elastic])
      ) {
        this.state = 'hidden';
      }
    } else if (input.specPickerInput.data) {
      if (input.specPickerInput.data.hostingEnvironmentName || input.specPickerInput.data.isXenon || input.specPickerInput.data.isElastic) {
        this.state = 'hidden';
      }
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}

export class StandardSmallPlanPriceSpec extends StandardPlanPriceSpec {
  skuCode = 'S1';
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
        quantity: 744,
        resourceId: null,
      },
    ],
  };
}

export class StandardMediumPlanPriceSpec extends StandardPlanPriceSpec {
  skuCode = 'S2';
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
        quantity: 744,
        resourceId: null,
      },
    ],
  };
}

export class StandardLargePlanPriceSpec extends StandardPlanPriceSpec {
  skuCode = 'S3';
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
        quantity: 744,
        resourceId: null,
      },
    ],
  };
}
