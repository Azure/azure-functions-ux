import { BasicPlanPriceSpec } from './BasicPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class BasicLargePlanPriceSpec extends BasicPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Basic.B3;
    this.legacySkuName = 'large_basic';
    this.topLevelFeatures = [t('pricing_ACU').format('400'), t('pricing_memory').format('7'), t('pricing_aSeriesComputeEquivalent')];

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          quantity: 744,
        },
      ],
    };
  }
}
