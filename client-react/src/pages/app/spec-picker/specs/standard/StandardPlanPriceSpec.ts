import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput } from '../PriceSpec';
import { style } from 'typestyle';

export abstract class StandardPlanPriceSpec extends PriceSpec {
  constructor() {
    super();
    this.tier = ServerFarmSkuConstants.Tier.standard;
    this.upsellEnabled = true;
    this.featureItems = [
      {
        iconUrl: 'image/ssl.svg',
        title: 'Custom domains / SSL',
        description: 'Configure and purchase custom domains with SNI and IP SSL bindings',
      },
      {
        iconUrl: 'image/scale-up.svg',
        title: 'Auto scale',
        description: 'Up to 10 instances. Subject to availability.',
      },
      {
        iconUrl: 'image/slots.svg',
        title: 'Staging slots',
        description: 'Up to 5 staging slots to use for testing and deployments before swapping them into production.',
      },
      {
        iconUrl: 'image/backups.svg',
        title: 'Daily backups',
        description: 'Backup your app 10 times daily.',
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
        description: '50 GB disk storage shared by all apps deployed in the App Service plan.',
      },
    ];

    this.cssClass = style({
      background: '#4D68C8',
    });
  }

  public runInitialization(input: PriceSpecInput) {
    if (input.plan) {
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.elastic])
      ) {
        this.state = 'hidden';
      }
    } else if (input.specPickerInput.data) {
      if (input.specPickerInput.data.hostingEnvironmentName || input.specPickerInput.data.isXenon || input.specPickerInput.data.isElastic) {
        this.state = 'hidden';
      }
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}
