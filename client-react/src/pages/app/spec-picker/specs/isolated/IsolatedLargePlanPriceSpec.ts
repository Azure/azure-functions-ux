import { IsolatedPlanPriceSpec } from './IsolatedPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class IsolatedLargePlanPriceSpec extends IsolatedPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Isolated.I3;
    this.legacySkuName = 'large_isolated';
    this.topLevelFeatures = ['840 total ACU', '14 GB memory', 'Dv2-Series compute equivalent'];

    this.meterFriendlyName = 'Isolated Large App Service Hours';

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
