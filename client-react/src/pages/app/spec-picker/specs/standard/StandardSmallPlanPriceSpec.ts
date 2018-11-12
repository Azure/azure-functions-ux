import { StandardPlanPriceSpec } from './StandardPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class StandardSmallPlanPriceSpec extends StandardPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Standard.S1;
    this.legacySkuName = 'small_standard';
    this.topLevelFeatures = ['100 total ACU', '1.75 GB memory', 'A-Series compute equivalent'];

    this.meterFriendlyName = 'Standard Small App Service Hours';

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
