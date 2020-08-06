import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from '../PriceSpec';
import { style } from 'typestyle';
import i18next from 'i18next';
import { Links } from '../../../../../utils/FwLinks';

export abstract class PremiumContainerPlanPriceSpec extends PriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.tier = ServerFarmSkuConstants.Tier.premiumContainer;
    this.featureItems = [
      {
        id: 'pricing_customDomainsSsl',
        iconUrl: 'image/ssl.svg',
        title: t('pricing_customDomainsSsl'),
        description: t('pricing_customDomainsIpSslDesc'),
      },
      {
        id: 'pricing_autoScale',
        iconUrl: 'image/scale-up.svg',
        title: t('pricing_autoScale'),
        description: t('pricing_scaleDesc').format(20),
      },
      {
        id: 'pricing_stagingSlots',
        iconUrl: 'image/slots.svg',
        title: t('pricing_stagingSlots'),
        description: t('pricing_slotsDesc').format(20),
      },
      {
        id: 'pricing_trafficManager',
        iconUrl: 'image/globe.svg',
        title: t('pricing_trafficManager'),
        description: t('pricing_trafficManagerDesc'),
      },
    ];

    this.hardwareItems = [
      {
        id: 'pricing_includedHardware_azureComputeUnits',
        iconUrl: 'image/app-service-plan.svg',
        title: t('pricing_includedHardware_azureComputeUnits'),
        description: t('pricing_computeDedicatedAcu'),
        learnMoreUrl: Links.azureComputeUnitLearnMore,
      },
      {
        id: 'memory',
        iconUrl: 'image/website-power.svg',
        title: t('memory'),
        description: t('pricing_dedicatedMemory'),
      },
      {
        id: 'storage',
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
    if (
      (input.specPickerInput.data && (input.specPickerInput.data.isXenon || input.specPickerInput.data.hyperV)) ||
      (input.plan && input.plan.properties.hyperV)
    ) {
      this.state = 'enabled';
    } else {
      this.state = 'hidden';
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}
