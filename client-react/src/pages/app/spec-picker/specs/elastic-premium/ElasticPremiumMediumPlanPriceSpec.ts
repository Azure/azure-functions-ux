import { ElasticPremiumPlanPriceSpec } from './ElasticPremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class ElasticPremiumMediumPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.ElasticPremium.EP2;
    this.legacySkuName = 'medium_elastic_premium';
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
