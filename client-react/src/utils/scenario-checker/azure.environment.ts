import { ScenarioIds } from './scenario-ids';
import { ServerFarmSkuConstants } from './ServerFarmSku';
import { ScenarioCheckInput, ScenarioResult, Environment } from './scenario.models';
import ServerFarmService from '../../ApiHelpers/ServerFarmService';
import { ArmPlanDescriptor } from '../../utils/resourceDescriptors';
import { CommonConstants } from '../../utils/CommonConstants';

export class AzureEnvironment extends Environment {
  public name = 'Azure';

  constructor(t: (string) => string) {
    super();
    this.scenarioChecks[ScenarioIds.addSiteFeaturesTab] = {
      id: ScenarioIds.addSiteFeaturesTab,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addSiteQuotas] = {
      id: ScenarioIds.addSiteQuotas,
      runCheck: (input: ScenarioCheckInput) => {
        return this.showSiteQuotas(input);
      },
    };

    this.scenarioChecks[ScenarioIds.addSiteFileStorage] = {
      id: ScenarioIds.addSiteFileStorage,
      runCheck: (input: ScenarioCheckInput) => {
        return this.showSiteFileStorage(input);
      },
    };

    this.scenarioChecks[ScenarioIds.getSiteSlotLimits] = {
      id: ScenarioIds.getSiteSlotLimits,
      runCheckAsync: (input: ScenarioCheckInput) => {
        return Promise.resolve(this.getSlotLimit(input));
      },
    };

    this.scenarioChecks[ScenarioIds.enablePlatform64] = {
      id: ScenarioIds.enablePlatform64,
      runCheck: (input: ScenarioCheckInput) => {
        const scenarioResult = this.enableIfBasicOrHigher(input);
        scenarioResult.data = t('use32BitWorkerProcessUpsell');
        return scenarioResult;
      },
    };

    this.scenarioChecks[ScenarioIds.incomingClientCertEnabled] = {
      id: ScenarioIds.incomingClientCertEnabled,
      runCheck: (input: ScenarioCheckInput) => {
        const scenarioResult = this.enableIfBasicOrHigher(input);
        scenarioResult.data = t('useIncomingClientCertsUpsell');
        return scenarioResult;
      },
    };

    this.scenarioChecks[ScenarioIds.enableAlwaysOn] = {
      id: ScenarioIds.enableAlwaysOn,
      runCheck: (input: ScenarioCheckInput) => {
        const scenarioResult = this.enableIfBasicOrHigher(input);
        scenarioResult.data = t('alwaysOnUpsell');
        return scenarioResult;
      },
    };

    this.scenarioChecks[ScenarioIds.webSocketsEnabled] = {
      id: ScenarioIds.webSocketsEnabled,
      runCheck: (input: ScenarioCheckInput) => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableSlots] = {
      id: ScenarioIds.enableSlots,
      runCheck: (input: ScenarioCheckInput) => {
        return this.enableIfStandardOrHigher(input);
      },
    };

    this.scenarioChecks[ScenarioIds.enableAutoSwap] = {
      id: ScenarioIds.enableAutoSwap,
      runCheck: (input: ScenarioCheckInput) => {
        const scenarioResult = this.enableIfStandardOrHigher(input);
        scenarioResult.data = t('autoSwapUpsell');
        return scenarioResult;
      },
    };

    this.scenarioChecks[ScenarioIds.showSideNavMenu] = {
      id: ScenarioIds.showSideNavMenu,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.canScaleForSlots] = {
      id: ScenarioIds.canScaleForSlots,
      runCheck: (input: ScenarioCheckInput) => {
        const enabled =
          input &&
          input.site &&
          (input.site.properties.sku === ServerFarmSkuConstants.Tier.free ||
            input.site.properties.sku === ServerFarmSkuConstants.Tier.shared ||
            input.site.properties.sku === ServerFarmSkuConstants.Tier.basic ||
            input.site.properties.sku === ServerFarmSkuConstants.Tier.standard);
        return { status: enabled ? 'enabled' : 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.showAppSettingsUpsell] = {
      id: ScenarioIds.showAppSettingsUpsell,
      runCheck: (input: ScenarioCheckInput) => {
        const enabled =
          input &&
          input.site &&
          (input.site.properties.sku === ServerFarmSkuConstants.Tier.free ||
            input.site.properties.sku === ServerFarmSkuConstants.Tier.shared);
        return { status: enabled ? 'enabled' : 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.isAppDensityEnabled] = {
      id: ScenarioIds.isAppDensityEnabled,
      runCheckAsync: (input: ScenarioCheckInput) => {
        const serverFarm = input.serverFarm;
        if (serverFarm) {
          const subscriptionId = new ArmPlanDescriptor(serverFarm.id).subscription;
          return ServerFarmService.getTotalSitesIncludingSlotsInServerFarm(subscriptionId, serverFarm.id).then(result => {
            const skuName = serverFarm.sku ? serverFarm.sku.name : '';
            return {
              status: this.isAppDensitySkuCode(skuName) && result[0].count_ >= CommonConstants.AppDensityLimit ? 'enabled' : 'disabled',
            };
          });
        } else {
          return {
            status: 'disabled',
          };
        }
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return process.env.REACT_APP_RUNETIME_TYPE === 'Azure';
  }

  private enableIfBasicOrHigher(input: ScenarioCheckInput): ScenarioResult {
    const disabled =
      input &&
      input.site &&
      (input.site.properties.sku === ServerFarmSkuConstants.Tier.free || input.site.properties.sku === ServerFarmSkuConstants.Tier.shared);

    return {
      status: disabled ? 'disabled' : 'enabled',
      data: null,
    };
  }

  private enableIfStandardOrHigher(input: ScenarioCheckInput): ScenarioResult {
    const disabled =
      input &&
      input.site &&
      (input.site.properties.sku === ServerFarmSkuConstants.Tier.free ||
        input.site.properties.sku === ServerFarmSkuConstants.Tier.shared ||
        input.site.properties.sku === ServerFarmSkuConstants.Tier.basic);

    return {
      status: disabled ? 'disabled' : 'enabled',
      data: null,
    };
  }

  private showSiteQuotas(input: ScenarioCheckInput): ScenarioResult {
    const site = input && input.site;

    if (!site) {
      throw Error('No site input specified');
    }

    const showQuotas =
      input.site!.properties.sku === ServerFarmSkuConstants.Tier.free || input.site!.properties.sku === ServerFarmSkuConstants.Tier.shared;

    return {
      status: showQuotas ? 'enabled' : 'disabled',
      data: null,
    };
  }

  private showSiteFileStorage(input: ScenarioCheckInput): ScenarioResult {
    const site = input && input.site;

    if (!site) {
      throw Error('No site input specified');
    }

    const showFileStorage =
      input.site!.properties.sku !== ServerFarmSkuConstants.Tier.free && input.site!.properties.sku !== ServerFarmSkuConstants.Tier.shared;

    return {
      status: showFileStorage ? 'enabled' : 'disabled',
      data: null,
    };
  }

  private getSlotLimit(input: ScenarioCheckInput): ScenarioResult {
    const site = input && input.site;
    if (!site) {
      throw Error('No site input specified');
    }

    let limit: number;

    switch (site.properties.sku) {
      case ServerFarmSkuConstants.Tier.free:
      case ServerFarmSkuConstants.Tier.basic:
        limit = 0;
        break;
      case ServerFarmSkuConstants.Tier.dynamic:
        limit = 1;
        break;
      case ServerFarmSkuConstants.Tier.standard:
        limit = 5;
        break;
      case ServerFarmSkuConstants.Tier.premium:
      case ServerFarmSkuConstants.Tier.premiumV2:
      case ServerFarmSkuConstants.Tier.isolated:
      case ServerFarmSkuConstants.Tier.premiumContainer:
      case ServerFarmSkuConstants.Tier.elasticPremium:
      case ServerFarmSkuConstants.Tier.elasticIsolated:
        limit = 20;
        break;
      default:
        limit = 0;
    }

    return {
      status: 'enabled',
      data: limit,
    };
  }

  private isAppDensitySkuCode(skuCode: string): boolean {
    const upperCaseSkuCode = skuCode.toUpperCase();
    return (
      upperCaseSkuCode === ServerFarmSkuConstants.SkuCode.Basic.B1 ||
      upperCaseSkuCode === ServerFarmSkuConstants.SkuCode.Standard.S1 ||
      upperCaseSkuCode === ServerFarmSkuConstants.SkuCode.Premium.P1 ||
      upperCaseSkuCode === ServerFarmSkuConstants.SkuCode.PremiumContainer.PC2 ||
      upperCaseSkuCode === ServerFarmSkuConstants.SkuCode.PremiumV2.P1V2 ||
      upperCaseSkuCode === ServerFarmSkuConstants.SkuCode.Isolated.I1 ||
      upperCaseSkuCode === ServerFarmSkuConstants.SkuCode.ElasticPremium.EP1
    );
  }
}
