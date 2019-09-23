import { StandardPlanPriceSpec } from './StandardPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import i18next from 'i18next';

export abstract class StandardSmallPlanPriceSpec extends StandardPlanPriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Standard.S1;
    this.legacySkuName = 'small_standard';
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
}
