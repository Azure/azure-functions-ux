import { BasicPlanPriceSpec } from './BasicPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class BasicSmallPlanPriceSpec extends BasicPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Basic.B1;
    this.legacySkuName = 'small_basic';
    this.topLevelFeatures = ['100 total ACU', '1.75 GB memory', 'A-Series compute equivalent'];

    this.meterFriendlyName = 'Basic Small App Service Hours';

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
