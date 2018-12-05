import { StandardPlanPriceSpec } from './StandardPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class StandardMediumPlanPriceSpec extends StandardPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Standard.S2;
    this.legacySkuName = 'medium_Standard';
    this.topLevelFeatures = [t('pricing_ACU').format('200'), t('pricing_memory').format('3.5'), t('pricing_aSeriesComputeEquivalent')];

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
