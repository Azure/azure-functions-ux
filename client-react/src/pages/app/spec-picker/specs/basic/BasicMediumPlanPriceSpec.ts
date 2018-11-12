import { BasicPlanPriceSpec } from './BasicPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class BasicMediumPlanPriceSpec extends BasicPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Basic.B2;
    this.legacySkuName = 'medium_basic';
    this.topLevelFeatures = ['200 total ACU', '3.5 GB memory', 'A-Series compute equivalent'];

    this.meterFriendlyName = 'Basic Medium App Service Hours';

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
