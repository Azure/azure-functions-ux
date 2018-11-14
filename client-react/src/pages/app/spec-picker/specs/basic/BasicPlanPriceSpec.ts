import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from '../PriceSpec';
import { style } from 'typestyle';

export abstract class BasicPlanPriceSpec extends PriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.tier = ServerFarmSkuConstants.Tier.basic;
    this.featureItems = [
      {
        iconUrl: 'image/ssl.svg',
        title: t('pricing_customDomainsSsl'),
        description: t('pricing_customDomainsSslDesc'),
      },
      {
        iconUrl: 'image/scale-up.svg',
        title: t('pricing_manualScale'),
        description: t('pricing_scaleDesc').format(3),
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
        description: t('pricing_dedicatedMemory'),
      },
      {
        iconUrl: 'image/storage.svg',
        title: t('storage'),
        description: t('pricing_sharedDisk').format('10 GB'),
      },
    ];

    this.cssClass = style({
      background: SpecColorCodes.BASIC,
    });
  }

  public async runInitialization(input: PriceSpecInput): Promise<void> {
    if (input.plan) {
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.elastic])
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
