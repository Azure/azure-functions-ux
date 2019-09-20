import { PremiumV2PlanPriceSpec } from './PremiumV2PlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import i18next from 'i18next';

export abstract class PremiumV2MediumPlanPriceSpec extends PremiumV2PlanPriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumV2.P2V2;
    this.legacySkuName = 'D2_premiumV2';
    this.topLevelFeatures = [t('pricing_ACU').format('420'), t('pricing_memory').format('7'), t('pricing_dSeriesComputeEquivalent')];

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          id: this.skuCode,
          quantity: CommonConstants.Pricing.hoursInAzureMonth,
        },
      ],
    };
  }
}
