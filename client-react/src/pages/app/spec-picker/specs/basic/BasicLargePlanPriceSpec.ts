import { BasicPlanPriceSpec } from './BasicPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class BasicLargePlanPriceSpec extends BasicPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Basic.B3;
    this.legacySkuName = 'large_basic';
    this.topLevelFeatures = ['400 total ACU', '7 GB memory', 'A-Series compute equivalent'];

    this.meterFriendlyName = 'Basic Large App Service Hours';

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
