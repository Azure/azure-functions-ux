import { IsolatedPlanPriceSpec } from './IsolatedPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class IsolatedLargePlanPriceSpec extends IsolatedPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Isolated.I3;
    this.legacySkuName = 'large_isolated';
    this.topLevelFeatures = [t('pricing_ACU').format('840'), t('pricing_memory').format('14'), t('pricing_dSeriesComputeEquivalent')];

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
