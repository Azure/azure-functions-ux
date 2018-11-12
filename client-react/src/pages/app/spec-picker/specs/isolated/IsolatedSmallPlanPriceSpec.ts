import { IsolatedPlanPriceSpec } from './IsolatedPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class IsolatedSmallPlanPriceSpec extends IsolatedPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Isolated.I1;
    this.legacySkuName = 'small_isolated';
    this.topLevelFeatures = [t('pricing_ACU').format('210'), t('pricing_memory').format('3.5'), t('pricing_dSeriesComputeEquivalent')];

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
