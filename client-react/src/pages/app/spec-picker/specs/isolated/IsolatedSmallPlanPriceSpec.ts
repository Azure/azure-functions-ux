import { IsolatedPlanPriceSpec } from './IsolatedPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import i18next from 'i18next';

export abstract class IsolatedSmallPlanPriceSpec extends IsolatedPlanPriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Isolated.I1;
    this.legacySkuName = 'small_isolated';
    this.topLevelFeatures = [t('pricing_ACU').format('210'), t('pricing_memory').format('3.5'), t('pricing_dSeriesComputeEquivalent')];

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
