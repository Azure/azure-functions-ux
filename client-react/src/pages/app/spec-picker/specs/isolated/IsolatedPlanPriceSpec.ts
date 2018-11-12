import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput } from '../PriceSpec';
import { NationalCloudEnvironment } from '../../../../../utils/scenario-checker/national-cloud.environment';
import { style } from 'typestyle';
import { store } from '../../../../../store';
import axios from 'axios';
import { ArmObj, HostingEnvironment } from '../../../../../models/WebAppModels';
import { HttpResult } from '../../../../../models/HttpResult';

export abstract class IsolatedPlanPriceSpec extends PriceSpec {
  constructor() {
    super();
    this.tier = ServerFarmSkuConstants.Tier.isolated;
    this.featureItems = [
      {
        iconUrl: 'image/app-service-environment.svg',
        title: 'Single tenant system',
        description: 'Take more control over the resources being used by your app.',
      },
      {
        iconUrl: 'image/networking.svg',
        title: 'Isolated network',
        description: 'Runs within your own virtual network.',
      },
      {
        iconUrl: 'image/active-directory.svg',
        title: 'Private app access',
        description: 'Using an App Service Environment with Internal Load Balancing (ILB).',
      },
      {
        iconUrl: 'image/scale-up.svg',
        title: 'Scale to a large number of instances',
        description: 'Up to 100 instances.  More allowed upon request.',
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
        description: '1 TB disk storage shared by all apps deployed in the App Service plan.',
      },
    ];

    this.cssClass = style({
      background: '#C44200',
    });
  }

  public runInitialization(input: PriceSpecInput) {
    if (NationalCloudEnvironment.isBlackforest() || NationalCloudEnvironment.isMooncake()) {
      this.state = 'hidden';
    } else if (input.plan) {
      if (
        !input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.isXenon ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.elastic])
      ) {
        this.state = 'hidden';
      } else {
        const armEndpoint = store.getState().portalService.startupInfo!.armEndpoint;
        const armToken = store.getState().portalService.startupInfo!.token;
        axios
          .get<{ value: HttpResult<ArmObj<HostingEnvironment>> }>(`${armEndpoint}${input.plan.properties.hostingEnvironmentProfile.id}`, {
            headers: {
              Authorization: `Bearer ${armToken}`,
            },
          })
          .then(r => {
            // If the call to get the ASE fails (maybe due to RBAC), then we can't confirm ASE v1 or v2
            // but we'll let them see the isolated card anyway.  The plan update will probably fail in
            // the back-end if it's ASE v1, but at least we allow real ASE v2 customers who don't have
            // ASE permissions to scale their plan.
            if (
              r.data.value.isSuccessful &&
              r.data.value.result &&
              r.data.value.result.kind &&
              r.data.value.result.kind.toLowerCase().indexOf(CommonConstants.Kinds.aseV2.toLowerCase()) === -1
            ) {
              this.state = 'hidden';
            }
          });
      }
    } else if (
      input.specPickerInput.data &&
      (!input.specPickerInput.data.allowAseV2Creation || input.specPickerInput.data.isXenon || input.specPickerInput.data.isElastic)
    ) {
      this.state = 'hidden';
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}
