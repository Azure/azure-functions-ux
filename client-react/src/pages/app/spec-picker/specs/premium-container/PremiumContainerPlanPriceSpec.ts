import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { PriceSpec, PriceSpecInput } from '../PriceSpec';
import { style } from 'typestyle';

export abstract class PremiumContainerPlanPriceSpec extends PriceSpec {
  constructor() {
    super();
    this.tier = ServerFarmSkuConstants.Tier.premiumContainer;
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

  public runInitialization(input: PriceSpecInput) {
    // NOTE(michinoy): Only allow premium containers for xenon.
    if ((input.specPickerInput.data && input.specPickerInput.data.isXenon) || (input.plan && input.plan.properties.isXenon)) {
      this.state = 'enabled';
    } else {
      this.state = 'hidden';
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}
