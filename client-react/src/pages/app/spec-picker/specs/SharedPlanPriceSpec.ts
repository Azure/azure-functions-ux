import { CommonConstants } from '../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput } from './PriceSpec';
import { style } from 'typestyle';

export abstract class SharedPlanPriceSpec extends PriceSpec {
  constructor() {
    super();
    this.tier = ServerFarmSkuConstants.Tier.shared;
    this.skuCode = ServerFarmSkuConstants.SkuCode.Shared.D1;
    this.legacySkuName = 'shared';
    this.topLevelFeatures = ['Shared insfrastructure', '1 GB memory', '240 minutes/day compute'];

    this.featureItems = [
      {
        iconUrl: 'image/custom-domains.svg',
        title: 'Custom domains',
        description: 'Configure and purchase custom domain names.',
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
        description: 'Memory available to run applications deployed and running in the App Service plan.',
      },
      {
        iconUrl: 'image/storage.svg',
        title: 'Storage',
        description: '1 GB disk storage shared by all apps deployed in the App Service plan.',
      },
    ];

    this.meterFriendlyName = 'Shared App Service Hours';

    this.specResourceSet = {
      id: this.skuCode,
      firstParty: [
        {
          quantity: 744,
          resourceId: null,
        },
      ],
    };

    this.cssClass = style({
      background: '#852EA7',
    });
  }

  public runInitialization(input: PriceSpecInput) {
    if (input.plan) {
      if (
        input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.linux, CommonConstants.Kinds.elastic])
      ) {
        this.state = 'hidden';
      }
    } else if (input.specPickerInput.data) {
      if (
        input.specPickerInput.data.hostingEnvironmentName ||
        input.specPickerInput.data.isLinux ||
        input.specPickerInput.data.isXenon ||
        input.specPickerInput.data.isElastic
      ) {
        this.state = 'hidden';
      }
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}
