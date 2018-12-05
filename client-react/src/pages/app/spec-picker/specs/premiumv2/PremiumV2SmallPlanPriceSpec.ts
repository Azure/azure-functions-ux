import { PremiumV2PlanPriceSpec } from './PremiumV2PlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';

export abstract class PremiumV2SmallPlanPriceSpec extends PremiumV2PlanPriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.PremiumV2.P1V2;
    this.legacySkuName = 'D1_premiumV2';
    this.topLevelFeatures = [t('pricing_ACU').format('210'), t('pricing_memory').format('3.5'), t('pricing_dSeriesComputeEquivalent')];

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
