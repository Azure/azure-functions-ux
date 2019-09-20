import { ElasticPremiumPlanPriceSpec } from './ElasticPremiumPlanPriceSpec';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import i18next from 'i18next';

export abstract class ElasticPremiumSmallPlanPriceSpec extends ElasticPremiumPlanPriceSpec {
  private readonly _ep1CpuCore = 1;
  private readonly _ep1Memory = 3.5;

  constructor(t: i18next.TFunction) {
    super(t);
    this.skuCode = ServerFarmSkuConstants.SkuCode.ElasticPremium.EP1;
    this.legacySkuName = 'small_elastic_premium';
    this.topLevelFeatures = [t('pricing_ACU').format('210'), t('pricing_memory').format('3.5'), t('pricing_dSeriesComputeEquivalent')];

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          id: ServerFarmSkuConstants.SkuCode.ElasticPremium.EPCPU,
          quantity: (CommonConstants.Pricing.secondsInAzureMonth * this._ep1CpuCore) / 100,
        },
        {
          id: ServerFarmSkuConstants.SkuCode.ElasticPremium.EPMemory,
          quantity: (CommonConstants.Pricing.secondsInAzureMonth * this._ep1Memory) / 100,
        },
      ],
    };
  }
}
