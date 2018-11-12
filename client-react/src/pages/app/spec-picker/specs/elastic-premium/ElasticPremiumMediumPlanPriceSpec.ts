import { ElasticPremiumPlanPriceSpec } from './ElasticPremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class ElasticPremiumMediumPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.ElasticPremium.EP2;
    this.legacySkuName = 'medium_elastic_premium';
    this.topLevelFeatures = ['420 total ACU', '7 GB memory', 'Dv2-Series compute equivalent'];

    this.meterFriendlyName = 'Elastic Premium Medium App Service Hours';

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
