import { CommonConstants } from '../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from './PriceSpec';
import { style } from 'typestyle';

export abstract class SharedPlanPriceSpec extends PriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.tier = ServerFarmSkuConstants.Tier.shared;
    this.skuCode = ServerFarmSkuConstants.SkuCode.Shared.D1;
    this.legacySkuName = 'shared';
    this.topLevelFeatures = [t('pricing_sharedInfrastructure'), t('pricing_memory').format(1), t('pricing_computeLimit').format(240)];

    this.featureItems = [
      {
        iconUrl: 'image/custom-domains.svg',
        title: t('feature_customDomainsName'),
        description: t('feature_customDomainsInfo'),
      },
    ];

    this.hardwareItems = [
      {
        iconUrl: 'image/app-service-plan.svg',
        title: t('pricing_includedHardware_azureComputeUnits'),
        description: t('pricing_computeDedicatedAcu'),
        learnMoreUrl: CommonConstants.Links.azureComputeUnitLearnMore,
      },
      {
        iconUrl: 'image/website-power.svg',
        title: t('memory'),
        description: t('pricing_sharedMemory'),
      },
      {
        iconUrl: 'image/storage.svg',
        title: t('storage'),
        description: t('pricing_sharedDisk').format('1 GB'),
      },
    ];

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          quantity: 744,
        },
      ],
    };

    this.cssClass = style({
      background: SpecColorCodes.PREMIUM,
    });
  }

  public runInitialization(input: PriceSpecInput) {
    if (input.plan) {
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.linux, CommonConstants.Kinds.elastic])
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

    return this.checkIfDreamspark(input.subscriptionId);
  }
}
