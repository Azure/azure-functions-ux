import { ElasticPremiumPlanPriceSpec } from './ElasticPremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class ElasticPremiumSmallPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.ElasticPremium.EP1;
    this.legacySkuName = 'small_elastic_premium';
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
