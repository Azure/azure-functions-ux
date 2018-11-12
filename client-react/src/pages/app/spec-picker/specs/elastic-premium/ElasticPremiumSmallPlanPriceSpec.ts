import { ElasticPremiumPlanPriceSpec } from './ElasticPremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class ElasticPremiumSmallPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.ElasticPremium.EP1;
    this.legacySkuName = 'small_elastic_premium';
    this.topLevelFeatures = ['210 total ACU', '3.5 GB memory', 'Dv2-Series compute equivalent'];

    this.meterFriendlyName = 'Elastic Premium Small App Service Hours';

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
