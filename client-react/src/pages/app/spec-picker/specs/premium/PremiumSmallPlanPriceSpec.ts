import { PremiumPlanPriceSpec } from './PremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumSmallPlanPriceSpec extends PremiumPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Premium.P1;
    this.legacySkuName = 'small_premium';
    this.topLevelFeatures = ['100 total ACU', '1.75 GB memory', 'A-Series compute equivalent'];

    this.meterFriendlyName = 'Premium Small App Service Hours';

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
    return ServerFarmSkuConstants.SkuCode.PremiumV2.P1V2;
  }
}
