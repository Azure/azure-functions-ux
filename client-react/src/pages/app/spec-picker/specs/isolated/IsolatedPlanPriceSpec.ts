import { CommonConstants } from '../../../../../utils/CommonConstants';
import { ServerFarmSkuConstants } from '../../../../../utils/scenario-checker/ServerFarmSku';
import { AppKind } from '../../../../../utils/AppKind';
import { PriceSpec, PriceSpecInput, SpecColorCodes } from '../PriceSpec';
import { NationalCloudEnvironment } from '../../../../../utils/scenario-checker/national-cloud.environment';
import { style } from 'typestyle';
import { HttpResult } from '../../../../../models/HttpResult';
import MakeArmCall from '../../../../../ApiHelpers/ArmHelper';
import i18next from 'i18next';
import { ArmObj } from '../../../../../models/arm-obj';
import { HostingEnvironment } from '../../../../../models/hostingEnvironment/hosting-environment';
import { Links } from '../../../../../utils/FwLinks';

export abstract class IsolatedPlanPriceSpec extends PriceSpec {
  constructor(t: i18next.TFunction) {
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
        learnMoreUrl: Links.azureComputeUnitLearnMore,
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
    if (NationalCloudEnvironment.isBlackforest()) {
      this.state = 'hidden';
    } else if (input.plan) {
      if (
        !input.plan.properties.hostingEnvironmentProfile ||
        input.plan.properties.hyperV ||
        AppKind.hasAnyKind(input.plan, [CommonConstants.Kinds.elastic])
      ) {
        this.state = 'hidden';
      } else {
        const hostingEnvironmentFetch = await MakeArmCall<{ value: HttpResult<ArmObj<HostingEnvironment>> }>({
          resourceId: input.plan.properties.hostingEnvironmentProfile.id,
          commandName: 'IsolatedPlanPriceSpec',
          apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
        });

        const result = hostingEnvironmentFetch;

        // If the call to get the ASE fails (maybe due to RBAC), then we can't confirm ASE v1 or v2 or v3
        // but we'll let them see the isolated card anyway.  The plan update will probably fail in
        // the back-end if it's ASE v1, but at least we allow real ASE v2/v3 customers who don't have
        // ASE permissions to scale their plan.
        if (
          result.data.value.isSuccessful &&
          result.data.value.result &&
          result.data.value.result.kind &&
          result.data.value.result.kind.toLowerCase().indexOf(CommonConstants.Kinds.aseV2.toLowerCase()) === -1 &&
          result.data.value.result.kind.toLowerCase().indexOf(CommonConstants.Kinds.aseV3.toLowerCase()) === -1
        ) {
          this.state = 'hidden';
        }
      }
    } else if (
      input.specPickerInput.data &&
      (!input.specPickerInput.data.allowAseV2Creation ||
        input.specPickerInput.data.isXenon ||
        input.specPickerInput.data.hyperV ||
        (input.specPickerInput.data.isNewFunctionAppCreate && input.specPickerInput.data.isElastic))
    ) {
      this.state = 'hidden';
    }

    return this.checkIfDreamspark(input.subscriptionId);
  }
}
