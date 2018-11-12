import { BasicPlanPriceSpec } from './BasicPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class BasicSmallPlanPriceSpec extends BasicPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Basic.B1;
    this.legacySkuName = 'small_basic';
    this.topLevelFeatures = [t('pricing_ACU').format('100'), t('pricing_memory').format('1.75'), t('pricing_aSeriesComputeEquivalent')];

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
