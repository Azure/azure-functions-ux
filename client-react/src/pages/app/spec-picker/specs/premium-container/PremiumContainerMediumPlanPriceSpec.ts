import { PremiumContainerPlanPriceSpec } from './PremiumContainerPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumContainerMediumPlanPriceSpec extends PremiumContainerPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumContainer.PC3;
    this.legacySkuName = 'medium_premium_container';
    this.topLevelFeatures = ['640 total ACU', '16 GB memory', 'Dv3-Series compute equivalent'];

    this.meterFriendlyName = 'Premium Container Medium App Service Hours';

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
