import { PremiumContainerPlanPriceSpec } from './PremiumContainerPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumContainerLargePlanPriceSpec extends PremiumContainerPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumContainer.PC4;
    this.legacySkuName = 'large_premium_container';
    this.topLevelFeatures = ['1280 total ACU', '32 GB memory', 'Dv3-Series compute equivalent'];

    this.meterFriendlyName = 'Premium Container Large App Service Hours';

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
