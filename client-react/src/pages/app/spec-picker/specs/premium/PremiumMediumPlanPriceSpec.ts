import { PremiumPlanPriceSpec } from './PremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import i18next from 'i18next';

export abstract class PremiumMediumPlanPriceSpec extends PremiumPlanPriceSpec {
  constructor(t: i18next.TFunction) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.Premium.P2;
    this.legacySkuName = 'medium_premium';
    this.topLevelFeatures = [t('pricing_ACU').format('200'), t('pricing_memory').format('3.5'), t('pricing_aSeriesComputeEquivalent')];

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          quantity: 744,
        },
      ],
    };
  }

  public getUpsellSpecSkuCode(): string {
    return ServerFarmSkuConstants.SkuCode.PremiumV2.P2V2;
  }
}
