import { Kinds, Pricing } from '../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';

export class SharedPlanPriceSpec extends PriceSpec {
  tier = Tier.shared;
  skuCode = SkuCode.Shared.D1;
  legacySkuName = 'shared';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_sharedInfrastructure),
    this._ts.instant(PortalResources.pricing_memory).format(1),
    this._ts.instant(PortalResources.pricing_computeLimit).format(240),
  ];

  featureItems = [
    {
      iconUrl: 'image/custom-domains.svg',
      title: this._ts.instant(PortalResources.feature_customDomainsName),
      description: this._ts.instant(PortalResources.feature_customDomainsInfo),
    },
  ];

  hardwareItems = [
    {
      iconUrl: 'image/website-power.svg',
      title: this._ts.instant(PortalResources.memory),
      description: this._ts.instant(PortalResources.pricing_sharedMemory),
    },
    {
      iconUrl: 'image/storage.svg',
      title: this._ts.instant(PortalResources.storage),
      description: this._ts.instant(PortalResources.pricing_sharedDisk).format('1 GB'),
    },
  ];

  meterFriendlyName = 'Shared App Service Hours';

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

  cssClass = 'spec premium-spec';

  runInitialization(input: PriceSpecInput) {
    if (input.plan) {
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.hyperV ||
        AppKind.hasAnyKind(input.plan, [Kinds.linux, Kinds.elastic])
      ) {
        this.state = 'hidden';
      }
    } else if (input.specPickerInput.data) {
      if (
        input.specPickerInput.data.hostingEnvironmentName ||
        input.specPickerInput.data.isLinux ||
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
