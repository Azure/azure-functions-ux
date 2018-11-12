import { PremiumV2PlanPriceSpec } from './PremiumV2PlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumV2MediumPlanPriceSpec extends PremiumV2PlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumV2.P2V2;
    this.legacySkuName = 'D2_premiumV2';
    this.topLevelFeatures = ['420 total ACU', '7 GB memory', 'Dv2-Series compute equivalent'];

    this.meterFriendlyName = 'Premium V2 Medium App Service Hours';

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
