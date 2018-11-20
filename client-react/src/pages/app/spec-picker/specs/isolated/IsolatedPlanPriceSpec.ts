import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from '../PriceSpec';
import { NationalCloudEnvironment } from '../../../../../utils/scenario-checker/national-cloud.environment';
import { style } from 'typestyle';
import { store } from '../../../../../store';
import axios from 'axios';
import { ArmObj, HostingEnvironment } from '../../../../../models/WebAppModels';
import { HttpResult } from '../../../../../models/HttpResult';

export abstract class IsolatedPlanPriceSpec extends PriceSpec {
  constructor(t: (string) => string) {
    super(t);
    this.tier = ServerFarmSkuConstants.Tier.isolated;
    this.featureItems = [
      {
        id: 'pricing_ase',
        iconUrl: 'image/app-service-environment.svg',
        title: t('pricing_ase'),
        description: t('pricing_aseDesc'),
      },
      {
        id: 'pricing_isolatedNetwork',
        iconUrl: 'image/networking.svg',
        title: t('pricing_isolatedNetwork'),
        description: t('pricing_isolatedNetworkDesc'),
      },
      {
        id: 'pricing_privateAppAccess',
        iconUrl: 'image/active-directory.svg',
        title: t('pricing_privateAppAccess'),
        description: t('pricing_privateAppAccessDesc'),
      },
      {
        id: 'pricing_largeScale',
        iconUrl: 'image/scale-up.svg',
        title: t('pricing_largeScale'),
        description: t('pricing_largeScaleDesc'),
      },
      {
        id: 'pricing_trafficManager',
        iconUrl: 'image/globe.svg',
        title: t('pricing_trafficManager'),
        description: t('pricing_trafficManagerDesc'),
      },
    ];

    this.hardwareItems = [
      {
        id: 'pricing_includedHardware_azureComputeUnits',
        iconUrl: 'image/app-service-plan.svg',
        title: t('pricing_includedHardware_azureComputeUnits'),
        description: t('pricing_computeDedicatedAcu'),
        learnMoreUrl: CommonConstants.Links.azureComputeUnitLearnMore,
      },
      {
        id: 'memory',
        iconUrl: 'image/website-power.svg',
        title: t('memory'),
        description: t('pricing_dedicatedMemory'),
      },
      {
        id: 'storage',
        iconUrl: 'image/storage.svg',
        title: t('storage'),
        description: t('pricing_sharedDisk').format('1 TB'),
      },
    ];

    this.cssClass = style({
      background: SpecColorCodes.ISOLATED,
    });
  }

  public async runInitialization(input: PriceSpecInput): Promise<void> {
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
        const hostingEnvironmentFetch = await axios.get<{ value: HttpResult<ArmObj<HostingEnvironment>> }>(
          `${armEndpoint}${input.plan.properties.hostingEnvironmentProfile.id}`,
          {
            headers: {
              Authorization: `Bearer ${armToken}`,
            },
          }
        );

        const result = hostingEnvironmentFetch.data;

        // If the call to get the ASE fails (maybe due to RBAC), then we can't confirm ASE v1 or v2
        // but we'll let them see the isolated card anyway.  The plan update will probably fail in
        // the back-end if it's ASE v1, but at least we allow real ASE v2 customers who don't have
        // ASE permissions to scale their plan.
        if (
          result.value.isSuccessful &&
          result.value.result &&
          result.value.result.kind &&
          result.value.result.kind.toLowerCase().indexOf(CommonConstants.Kinds.aseV2.toLowerCase()) === -1
        ) {
          this.state = 'hidden';
        }
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
