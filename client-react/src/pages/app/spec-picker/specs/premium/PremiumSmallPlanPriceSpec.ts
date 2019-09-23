import { PremiumPlanPriceSpec } from './PremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import i18next from 'i18next';

export abstract class PremiumSmallPlanPriceSpec extends PremiumPlanPriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Premium.P1;
    this.legacySkuName = 'small_premium';
    this.topLevelFeatures = [t('pricing_ACU').format('100'), t('pricing_memory').format('1.75'), t('pricing_aSeriesComputeEquivalent')];

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

  public getUpsellSpecSkuCode(): string {
    return ServerFarmSkuConstants.SkuCode.PremiumV2.P1V2;
  }
}
