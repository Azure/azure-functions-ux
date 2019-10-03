import { StandardPlanPriceSpec } from './StandardPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import i18next from 'i18next';

export abstract class StandardLargePlanPriceSpec extends StandardPlanPriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Standard.S3;
    this.legacySkuName = 'large_Standard';
    this.topLevelFeatures = [t('pricing_ACU').format('400'), t('pricing_memory').format('7'), t('pricing_aSeriesComputeEquivalent')];

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
