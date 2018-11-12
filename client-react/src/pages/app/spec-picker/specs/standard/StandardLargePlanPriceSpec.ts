import { StandardPlanPriceSpec } from './StandardPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class StandardLargePlanPriceSpec extends StandardPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Standard.S3;
    this.legacySkuName = 'large_Standard';
    this.topLevelFeatures = ['400 total ACU', '7 GB memory', 'A-Series compute equivalent'];

    this.meterFriendlyName = 'Standard Large App Service Hours';

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
