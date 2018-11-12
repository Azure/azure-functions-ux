import { IsolatedPlanPriceSpec } from './IsolatedPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class IsolatedSmallPlanPriceSpec extends IsolatedPlanPriceSpec {
  constructor() {
    super();
    this.skuCode = ServerFarmSkuConstants.SkuCode.Isolated.I1;
    this.legacySkuName = 'small_isolated';
    this.topLevelFeatures = ['210 total ACU', '3.5 GB memory', 'Dv2-Series compute equivalent'];

    this.meterFriendlyName = 'Isolated Small App Service Hours';

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
