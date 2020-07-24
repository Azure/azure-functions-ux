import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from '../PriceSpec';
import { style } from 'typestyle';
import i18next from 'i18next';
import { Links } from '../../../../../utils/FwLinks';

export abstract class BasicPlanPriceSpec extends PriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.tier = ServerFarmSkuConstants.Tier.basic;
    this.featureItems = [
      {
        id: 'pricing_customDomainsSsl',
        iconUrl: 'image/ssl.svg',
        title: t('pricing_customDomainsSsl'),
        description: t('pricing_customDomainsSslDesc'),
      },
      {
        id: 'pricing_manualScale',
        iconUrl: 'image/scale-up.svg',
        title: t('pricing_manualScale'),
        description: t('pricing_scaleDesc').format(3),
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
        input.plan.properties.hyperV ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.elastic])
      ) {
        this.state = 'hidden';
      }
    } else if (input.specPickerInput.data) {
      if (
        input.specPickerInput.data.hostingEnvironmentName ||
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
