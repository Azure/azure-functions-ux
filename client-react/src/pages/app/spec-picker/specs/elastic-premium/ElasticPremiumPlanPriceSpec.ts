import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PlanSpecPickerData } from '../PriceSpec';
import { style } from 'typestyle';
import { DV2SeriesPriceSpec } from '../DV2SeriesPriceSpec';
import { ArmObj, Sku, ServerFarm } from '../../../../../models/WebAppModels';

export abstract class ElasticPremiumPlanPriceSpec extends DV2SeriesPriceSpec {
  constructor() {
    super(
      ServerFarmSkuConstants.Tier.elasticPremium,
      'Elastic Premium is not supported for this scale unit. Please consider redeploying or cloning your app.',
      CommonConstants.Links.premiumV2NotAvailableLearnMore
    );
    this.tier = ServerFarmSkuConstants.Tier.elasticPremium;
    this.featureItems = [
      {
        iconUrl: 'image/scale-up.svg',
        title: 'Rapid scale',
        description: 'Scale out function apps based on event trigger.',
      },
      {
        iconUrl: 'image/networking.svg',
        title: 'Virtual Network Integration',
        description: 'Runs within your own virtual network.',
      },
      {
        iconUrl: 'image/slots.svg',
        title: 'High Density',
        description: 'Efficiently share an App Service plan across multiple Function Apps.',
      },
      {
        iconUrl: 'image/ssl.svg',
        title: 'Custom domains / SSL',
        description: 'Configure and purchase custom domains with SNI and IP SSL bindings',
      },
      {
        iconUrl: 'image/globe.svg',
        title: 'Traffic manager',
        description: 'Improve performance and availability by routing traffic between multiple instances of your app.',
      },
    ];

    this.hardwareItems = [
      {
        iconUrl: 'image/app-service-plan.svg',
        title: 'Azure Compute Units (ACU)',
        description: 'Dedicated compute resources used to run applications deployed in the App Service Plan.',
        learnMoreUrl: CommonConstants.Links.azureComputeUnitLearnMore,
      },
      {
        iconUrl: 'image/website-power.svg',
        title: 'Memory',
        description: 'Memory per instance available to run applications deployed and running in the App Service plan.',
      },
    ];

    this.cssClass = style({
      background: '#852EA7',
    });
  }

  protected _matchSku(sku: Sku): boolean {
    return sku.name.toLowerCase().startsWith('ep');
  }

  protected _shouldHideForNewPlan(data: PlanSpecPickerData): boolean {
    return !!data.hostingEnvironmentName || data.isXenon || !data.isElastic;
  }

  protected _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean {
    return (
      !!plan.properties.hostingEnvironmentProfile || plan.properties.isXenon || !AppKind.hasAnyKind(plan, [CommonConstants.Kinds.elastic])
    );
  }
}
