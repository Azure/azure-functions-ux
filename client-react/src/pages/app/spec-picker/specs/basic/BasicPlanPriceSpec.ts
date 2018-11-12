import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput } from '../PriceSpec';
import { style } from 'typestyle';

export abstract class BasicPlanPriceSpec extends PriceSpec {
  constructor() {
    super();
    this.tier = ServerFarmSkuConstants.Tier.basic;
    this.featureItems = [
      {
        iconUrl: 'image/ssl.svg',
        title: 'Custom domains / SSL',
        description: 'Configure and purchase custom domains with SNI SSL bindings',
      },
      {
        iconUrl: 'image/scale-up.svg',
        title: 'Manual scale',
        description: 'Up to 3 instances.  Subject to availability.',
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
        description: '10 GB disk storage shared by all apps deployed in the App Service plan.',
      },
    ];

    this.cssClass = style({
      background: '#5A8000',
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
