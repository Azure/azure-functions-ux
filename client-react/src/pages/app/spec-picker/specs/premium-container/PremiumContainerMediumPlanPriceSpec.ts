import { PremiumContainerPlanPriceSpec } from './PremiumContainerPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumContainerMediumPlanPriceSpec extends PremiumContainerPlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumContainer.PC3;
    this.legacySkuName = 'medium_premium_container';
    this.topLevelFeatures = [t('pricing_ACU').format('640'), t('pricing_memory').format('16'), t('pricing_dv3SeriesComputeEquivalent')];

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
