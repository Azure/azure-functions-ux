import { PremiumContainerPlanPriceSpec } from './PremiumContainerPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumContainerLargePlanPriceSpec extends PremiumContainerPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumContainer.PC4;
    this.legacySkuName = 'large_premium_container';
    this.topLevelFeatures = [t('pricing_ACU').format('1280'), t('pricing_memory').format('32'), t('pricing_dv3SeriesComputeEquivalent')];

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          quantity: 744,
        },
      ],
    };
  }
}
