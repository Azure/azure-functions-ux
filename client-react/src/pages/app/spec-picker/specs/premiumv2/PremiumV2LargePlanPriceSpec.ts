import { PremiumV2PlanPriceSpec } from './PremiumV2PlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumV2LargePlanPriceSpec extends PremiumV2PlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumV2.P3V2;
    this.legacySkuName = 'D3_premiumV2';
    this.topLevelFeatures = ['840 total ACU', '14 GB memory', 'Dv2-Series compute equivalent'];

    this.meterFriendlyName = 'Premium V2 Large App Service Hours';

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
