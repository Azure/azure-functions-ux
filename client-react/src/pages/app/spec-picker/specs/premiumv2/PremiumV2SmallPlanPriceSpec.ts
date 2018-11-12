import { PremiumV2PlanPriceSpec } from './PremiumV2PlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumV2SmallPlanPriceSpec extends PremiumV2PlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumV2.P1V2;
    this.legacySkuName = 'D1_premiumV2';
    this.topLevelFeatures = ['210 total ACU', '3.5 GB memory', 'Dv2-Series compute equivalent'];

    this.meterFriendlyName = 'Premium V2 Small App Service Hours';

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
