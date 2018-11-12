import { StandardPlanPriceSpec } from './StandardPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class StandardMediumPlanPriceSpec extends StandardPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Standard.S2;
    this.legacySkuName = 'medium_Standard';
    this.topLevelFeatures = ['200 total ACU', '3.5 GB memory', 'A-Series compute equivalent'];

    this.meterFriendlyName = 'Standard Medium App Service Hours';

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
