import { PremiumContainerPlanPriceSpec } from './PremiumContainerPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumContainerSmallPlanPriceSpec extends PremiumContainerPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumContainer.PC2;
    this.legacySkuName = 'small_premium_container';
    this.topLevelFeatures = ['320 total ACU', '8 GB memory', 'Dv3-Series compute equivalent'];

    this.meterFriendlyName = 'Premium Container Small App Service Hours';

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
