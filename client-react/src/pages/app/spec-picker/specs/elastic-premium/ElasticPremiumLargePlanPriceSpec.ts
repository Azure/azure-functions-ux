import { ElasticPremiumPlanPriceSpec } from './ElasticPremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import i18next from 'i18next';

export abstract class ElasticPremiumLargePlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  private readonly _ep3CpuCore = 4;
  private readonly _ep3Memory = 14;

  constructor(t: i18next.TFunction) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.ElasticPremium.EP3;
    this.legacySkuName = 'large_elastic_premium';
    this.topLevelFeatures = [t('pricing_ACU').format('840'), t('pricing_memory').format('14'), t('pricing_dSeriesComputeEquivalent')];

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          id: ServerFarmSkuConstants.SkuCode.ElasticPremium.EPCPU,
          quantity: (CommonConstants.Pricing.secondsInAzureMonth * this._ep3CpuCore) / 100,
        },
        {
          id: ServerFarmSkuConstants.SkuCode.ElasticPremium.EPMemory,
          quantity: (CommonConstants.Pricing.secondsInAzureMonth * this._ep3Memory) / 100,
        },
      ],
    };
  }
}
