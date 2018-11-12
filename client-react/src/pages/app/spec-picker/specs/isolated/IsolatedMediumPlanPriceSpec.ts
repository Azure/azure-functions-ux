import { IsolatedPlanPriceSpec } from './IsolatedPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class IsolatedMediumPlanPriceSpec extends IsolatedPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Isolated.I2;
    this.legacySkuName = 'medium_isolated';
    this.topLevelFeatures = ['420 total ACU', '7 GB memory', 'Dv2-Series compute equivalent'];

    this.meterFriendlyName = 'Isolated Medium App Service Hours';

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
