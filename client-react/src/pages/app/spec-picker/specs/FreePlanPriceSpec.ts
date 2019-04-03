import { CommonConstants } from '../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from './PriceSpec';
import { style } from 'typestyle';
import i18next from 'i18next';

export abstract class FreePlanPriceSpec extends PriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.tier = ServerFarmSkuConstants.Tier.free;
    this.skuCode = ServerFarmSkuConstants.SkuCode.Free.F1;
    this.legacySkuName = 'free';
    this.topLevelFeatures = [t('pricing_sharedInfrastructure'), t('pricing_memory').format(1), t('pricing_computeLimit').format(60)];

    this.featureItems = [];

    this.hardwareItems = [
      {
        id: 'pricing_includedHardware_azureComputeUnits',
        iconUrl: 'image/app-service-plan.svg',
        title: t('pricing_includedHardware_azureComputeUnits'),
        description: t('pricing_computeDedicatedAcu'),
        learnMoreUrl: CommonConstants.Links.azureComputeUnitLearnMore,
      },
      {
        id: 'memory',
        iconUrl: 'image/website-power.svg',
        title: t('memory'),
        description: t('pricing_sharedMemory'),
      },
      {
        id: 'storage',
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
      background: SpecColorCodes.FREE,
    });

    this.allowZeroCost = true;
  }

  public async runInitialization(input: PriceSpecInput): Promise<void> {
    if (input.plan) {
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.linux, CommonConstants.Kinds.elastic])
      ) {
        this.state = 'hidden';
      }
    } else if (input.specPickerInput.data) {
      if (input.specPickerInput.data.hostingEnvironmentName || input.specPickerInput.data.isLinux || input.specPickerInput.data.isXenon) {
        this.state = 'hidden';
      }
    }
  }
}
