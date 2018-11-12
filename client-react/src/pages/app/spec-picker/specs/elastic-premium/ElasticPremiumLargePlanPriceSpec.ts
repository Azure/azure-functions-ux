import { ElasticPremiumPlanPriceSpec } from './ElasticPremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class ElasticPremiumLargePlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.ElasticPremium.EP3;
    this.legacySkuName = 'large_elastic_premium';
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
