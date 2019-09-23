import { ElasticPremiumPlanPriceSpec } from './ElasticPremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import i18next from 'i18next';

export abstract class ElasticPremiumMediumPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  private readonly _ep2CpuCore = 2;
  private readonly _ep2Memory = 7;

  constructor(t: i18next.TFunction) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.ElasticPremium.EP2;
    this.legacySkuName = 'medium_elastic_premium';
    this.topLevelFeatures = [t('pricing_ACU').format('420'), t('pricing_memory').format('7'), t('pricing_dSeriesComputeEquivalent')];

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          id: ServerFarmSkuConstants.SkuCode.ElasticPremium.EPCPU,
          quantity: (CommonConstants.Pricing.secondsInAzureMonth * this._ep2CpuCore) / 100,
        },
        {
          id: ServerFarmSkuConstants.SkuCode.ElasticPremium.EPMemory,
          quantity: (CommonConstants.Pricing.secondsInAzureMonth * this._ep2Memory) / 100,
        },
      ],
    };
  }
}
