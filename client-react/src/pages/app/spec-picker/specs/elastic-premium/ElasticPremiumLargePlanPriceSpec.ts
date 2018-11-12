import { ElasticPremiumPlanPriceSpec } from './ElasticPremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class ElasticPremiumLargePlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.ElasticPremium.EP3;
    this.legacySkuName = 'large_elastic_premium';
    this.topLevelFeatures = ['840 total ACU', '14 GB memory', 'Dv2-Series compute equivalent'];

    this.meterFriendlyName = 'Elastic Premium Large App Service Hours';

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          quantity: 744,
          resourceId: null,
        },
      ],
    };
  }
}
