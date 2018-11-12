import { PremiumPlanPriceSpec } from './PremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumLargePlanPriceSpec extends PremiumPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Premium.P3;
    this.legacySkuName = 'large_premium';
    this.topLevelFeatures = ['400 total ACU', '7 GB memory', 'A-Series compute equivalent'];

    this.meterFriendlyName = 'Premium Large App Service Hours';

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
    return ServerFarmSkuConstants.SkuCode.PremiumV2.P3V2;
  }
}
