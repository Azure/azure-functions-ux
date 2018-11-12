import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PlanSpecPickerData } from '../PriceSpec';
import { style } from 'typestyle';
import { DV2SeriesPriceSpec } from '../DV2SeriesPriceSpec';
import { ArmObj, Sku, ServerFarm } from '../../../../../models/WebAppModels';

export abstract class PremiumV2PlanPriceSpec extends DV2SeriesPriceSpec {
  constructor() {
    super(
      ServerFarmSkuConstants.Tier.premiumV2,
      'Premium V2 is not supported for this scale unit. Please consider redeploying or cloning your app.',
      CommonConstants.Links.premiumV2NotAvailableLearnMore
    );
    this.tier = ServerFarmSkuConstants.Tier.premiumV2;
    this.featureItems = [
      {
        iconUrl: 'image/ssl.svg',
        title: 'Custom domains / SSL',
        description: 'Configure and purchase custom domains with SNI and IP SSL bindings',
      },
      {
        iconUrl: 'image/scale-up.svg',
        title: 'Auto scale',
        description: 'Up to 20 instances. Subject to availability.',
      },
      {
        iconUrl: 'image/slots.svg',
        title: 'Staging slots',
        description: 'Up to 20 staging slots to use for testing and deployments before swapping them into production.',
      },
      {
        iconUrl: 'image/backups.svg',
        title: 'Daily backups',
        description: 'Backup your app 50 times daily.',
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
      {
        iconUrl: 'image/storage.svg',
        title: 'Storage',
        description: '250 GB disk storage shared by all apps deployed in the App Service plan.',
      },
    ];

    this.cssClass = style({
      background: '#852EA7',
    });
  }

  protected _matchSku(sku: Sku): boolean {
    return sku.name.indexOf('v2') > -1;
  }

  protected _shouldHideForNewPlan(data: PlanSpecPickerData): boolean {
    return !!data.hostingEnvironmentName || data.isXenon || !!data.isElastic;
  }

  protected _shouldHideForExistingPlan(plan: ArmObj<ServerFarm>): boolean {
    return (
      !!plan.properties.hostingEnvironmentProfile || plan.properties.isXenon || AppKind.hasAnyKind(plan, [CommonConstants.Kinds.elastic])
    );
  }
}
