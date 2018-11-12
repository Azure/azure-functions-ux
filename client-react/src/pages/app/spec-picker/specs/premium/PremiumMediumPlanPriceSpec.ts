import { PremiumPlanPriceSpec } from './PremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumMediumPlanPriceSpec extends PremiumPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Premium.P2;
    this.legacySkuName = 'medium_premium';
    this.topLevelFeatures = ['200 total ACU', '3.5 GB memory', 'A-Series compute equivalent'];

    this.meterFriendlyName = 'Premium Medium App Service Hours';

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

  public getUpsellSpecSkuCode(): string {
    return ServerFarmSkuConstants.SkuCode.PremiumV2.P2V2;
  }
}
