import { Observable } from 'rxjs/Observable';
import { Kinds, Links } from './../../../shared/models/constants';
import { Tier, SkuCode } from './../../../shared/models/serverFarmSku';
import { PortalResources } from './../../../shared/models/portal-resources';
import { AppKind } from './../../../shared/Utilities/app-kind';
import { PriceSpec, PriceSpecInput } from './price-spec';

export class FreePlanPriceSpec extends PriceSpec {
  tier = Tier.free;
  skuCode = SkuCode.Free.F1;
  legacySkuName = 'free';
  topLevelFeatures = [
    this._ts.instant(PortalResources.pricing_sharedInfrastructure),
    this._ts.instant(PortalResources.pricing_memory).format(1),
    this._ts.instant(PortalResources.pricing_computeLimit).format(60),
  ];

  featureItems = null;

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
      description: this._ts.instant(PortalResources.pricing_sharedMemory),
    },
    {
      iconUrl: 'image/storage.svg',
      title: this._ts.instant(PortalResources.storage),
      description: this._ts.instant(PortalResources.pricing_sharedDisk).format('1 GB'),
    },
  ];

  meterFriendlyName = 'Free App Service';

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        quantity: 744,
        resourceId: null,
      },
    ],
  };

  cssClass = 'spec free-spec';

  allowZeroCost = true;

  runInitialization(input: PriceSpecInput) {
    if (input.plan) {
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [Kinds.linux, Kinds.elastic])
      ) {
        this.state = 'hidden';
      }
    } else if (input.specPickerInput.data) {
      if (
        input.specPickerInput.data.hostingEnvironmentName ||
        input.specPickerInput.data.isLinux ||
        input.specPickerInput.data.isXenon ||
        input.specPickerInput.data.isElastic
      ) {
        this.state = 'hidden';
      }
    }

    return Observable.of(null);
  }
}
