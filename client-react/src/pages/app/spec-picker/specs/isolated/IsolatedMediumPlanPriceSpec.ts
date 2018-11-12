import { IsolatedPlanPriceSpec } from './IsolatedPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class IsolatedMediumPlanPriceSpec extends IsolatedPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Isolated.I2;
    this.legacySkuName = 'medium_isolated';
    this.topLevelFeatures = [t('pricing_ACU').format('420'), t('pricing_memory').format('7'), t('pricing_dSeriesComputeEquivalent')];

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
