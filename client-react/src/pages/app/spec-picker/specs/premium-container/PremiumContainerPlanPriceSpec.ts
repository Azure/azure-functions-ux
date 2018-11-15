import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from '../PriceSpec';
import { style } from 'typestyle';

export abstract class PremiumContainerPlanPriceSpec extends PriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.tier = ServerFarmSkuConstants.Tier.premiumContainer;
    this.featureItems = [
      {
        iconUrl: 'image/ssl.svg',
        title: t('pricing_customDomainsSsl'),
        description: t('pricing_customDomainsIpSslDesc'),
      },
      {
        iconUrl: 'image/scale-up.svg',
        title: t('pricing_autoScale'),
        description: t('pricing_scaleDesc').format(20),
      },
      {
        iconUrl: 'image/slots.svg',
        title: t('pricing_stagingSlots'),
        description: t('pricing_slotsDesc').format(20),
      },
      {
        iconUrl: 'image/globe.svg',
        title: t('pricing_trafficManager'),
        description: t('pricing_trafficManagerDesc'),
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
        description: t('pricing_premiumContainerSharedDisk').format('250 GB'),
      },
    ];

    this.cssClass = style({
      background: SpecColorCodes.PREMIUM,
    });
  }

  public async runInitialization(input: PriceSpecInput): Promise<void> {
    // NOTE(shimedh): Only allow premium containers for xenon.
    if ((input.specPickerInput.data && input.specPickerInput.data.isXenon) || (input.plan && input.plan.properties.isXenon)) {
      this.state = 'enabled';
    } else {
      this.state = 'hidden';
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}
