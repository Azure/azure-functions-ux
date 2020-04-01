import { ScenarioCheckInput, ScenarioResult, Environment } from './scenario.models';
import { ScenarioIds } from './scenario-ids';
import { ArmSiteDescriptor } from '../resourceDescriptors';
import { QuotaService } from '../QuotaService';
import { QuotaNames, QuotaScope } from '../../models/quotaSettings';
import { ComputeMode } from '../../models/site/compute-mode';

export class OnPremEnvironment extends Environment {
  public name = 'OnPrem';
  private _quotaService: QuotaService;
  private _upSellMessage: string;

  constructor(t: (string) => string) {
    super();
    this._quotaService = new QuotaService();
    this._upSellMessage = t('upgradeUpsell');
    this.scenarioChecks[ScenarioIds.addSiteFeaturesTab] = {
      id: ScenarioIds.addSiteFeaturesTab,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.openOldWebhostingPlanBlade] = {
      id: ScenarioIds.openOldWebhostingPlanBlade,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.appInsightsConfigurable] = {
      id: ScenarioIds.appInsightsConfigurable,
      runCheckAsync: () => {
        return Promise.resolve({
          status: 'disabled',
          data: null,
        } as ScenarioResult);
      },
    };

    this.scenarioChecks[ScenarioIds.addPushNotifications] = {
      id: ScenarioIds.addPushNotifications,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addDiagnoseAndSolve] = {
      id: ScenarioIds.addDiagnoseAndSolve,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.deploymentCenter] = {
      id: ScenarioIds.deploymentCenter,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.remoteDebuggingSupported] = {
      id: ScenarioIds.remoteDebuggingSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.useOldScaleUpBlade] = {
      id: ScenarioIds.useOldScaleUpBlade,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.useOldActivityLogBlade] = {
      id: ScenarioIds.useOldActivityLogBlade,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.pricingTierApiEnabled] = {
      id: ScenarioIds.pricingTierApiEnabled,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.functionBeta] = {
      id: ScenarioIds.functionBeta,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addSiteQuotas] = {
      id: ScenarioIds.addSiteQuotas,
      runCheck: (input: ScenarioCheckInput) => {
        return this._showSiteQuotas(input);
      },
    };

    this.scenarioChecks[ScenarioIds.addSiteFileStorage] = {
      id: ScenarioIds.addSiteFileStorage,
      runCheck: (input: ScenarioCheckInput) => {
        return this._showSiteFileStorage(input);
      },
    };

    this.scenarioChecks[ScenarioIds.addLogicApps] = {
      id: ScenarioIds.addLogicApps,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableAlwaysOn] = {
      id: ScenarioIds.enableAlwaysOn,
      runCheckAsync: (input: ScenarioCheckInput) => {
        if (!input || !input.site || !input.site.id) {
          return Promise.resolve({
            status: 'disabled',
            data: this._upSellMessage,
          } as ScenarioResult);
        }
        const armSiteDescriptor = new ArmSiteDescriptor(input.site.id);
        return this._quotaService
          .getQuotaLimit(
            armSiteDescriptor.subscription,
            QuotaNames.alwaysOnEnabled,
            input.site.properties.sku,
            input.site.properties.computeMode,
            QuotaScope.Site
          )
          .then(limit => {
            return {
              // limit is infinity when it is -1
              status: limit !== null && limit !== 0 ? 'enabled' : 'disabled',
              data: this._upSellMessage,
            } as ScenarioResult;
          });
      },
    };

    this.scenarioChecks[ScenarioIds.enableAutoSwap] = {
      id: ScenarioIds.enableAutoSwap,
      runCheckAsync: (input: ScenarioCheckInput) => {
        if (!input || !input.site || !input.site.id) {
          return Promise.resolve({
            status: 'disabled',
            data: this._upSellMessage,
          } as ScenarioResult);
        }
        const armSiteDescriptor = new ArmSiteDescriptor(input.site.id);
        return this._quotaService
          .getQuotaLimit(
            armSiteDescriptor.subscription,
            QuotaNames.numberOfSlotsPerSite,
            input.site.properties.sku,
            input.site.properties.computeMode
          )
          .then(limit => {
            return {
              status: limit !== null && (limit > 1 || limit === -1) ? 'enabled' : 'disabled',
              data: this._upSellMessage,
            } as ScenarioResult;
          });
      },
    };

    this.scenarioChecks[ScenarioIds.getSiteSlotLimits] = {
      id: ScenarioIds.getSiteSlotLimits,
      runCheckAsync: (input: ScenarioCheckInput) => {
        return this._getSlotLimit(input);
      },
    };

    this.scenarioChecks[ScenarioIds.enablePlatform64] = {
      id: ScenarioIds.enablePlatform64,
      runCheckAsync: (input: ScenarioCheckInput) => {
        if (!input || !input.site || !input.site.id) {
          return Promise.resolve({
            status: 'disabled',
            data: this._upSellMessage,
          } as ScenarioResult);
        }
        const armSiteDescriptor = new ArmSiteDescriptor(input.site.id);
        return this._quotaService
          .getQuotaLimit(
            armSiteDescriptor.subscription,
            QuotaNames.workerProcess64BitEnabled,
            input.site.properties.sku,
            input.site.properties.computeMode
          )
          .then(limit => {
            return {
              status: limit !== null && limit !== 0 ? 'enabled' : 'disabled',
              data: this._upSellMessage,
            } as ScenarioResult;
          });
      },
    };

    this.scenarioChecks[ScenarioIds.webSocketsEnabled] = {
      id: ScenarioIds.webSocketsEnabled,
      runCheckAsync: (input: ScenarioCheckInput) => {
        if (!input || !input.site || !input.site.id) {
          return Promise.resolve({
            status: 'disabled',
            data: this._upSellMessage,
          } as ScenarioResult);
        }
        const armSiteDescriptor = new ArmSiteDescriptor(input.site.id);
        return this._quotaService
          .getQuotaLimit(
            armSiteDescriptor.subscription,
            QuotaNames.webSocketsEnabled,
            input.site.properties.sku,
            input.site.properties.computeMode
          )
          .then(limit => {
            return {
              status: limit !== null && limit !== 0 ? 'enabled' : 'disabled',
              data: this._upSellMessage,
            } as ScenarioResult;
          });
      },
    };

    this.scenarioChecks[ScenarioIds.isAppDensityEnabled] = {
      id: ScenarioIds.isAppDensityEnabled,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.showAppInsightsLogs] = {
      id: ScenarioIds.showAppInsightsLogs,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return process.env.REACT_APP_RUNETIME_TYPE === 'OnPrem';
  }

  private _showSiteQuotas(input: ScenarioCheckInput): ScenarioResult {
    const site = input && input.site;

    if (!site) {
      throw Error('No site input specified');
    }

    const showQuotas = site.properties.computeMode === ComputeMode.Shared;

    return {
      status: showQuotas ? 'enabled' : 'disabled',
      data: null,
    };
  }

  private _showSiteFileStorage(input: ScenarioCheckInput): ScenarioResult {
    const site = input && input.site;

    if (!site) {
      throw Error('No site input specified');
    }

    const showFileStorage = site.properties.computeMode !== ComputeMode.Shared;

    return {
      status: showFileStorage ? 'enabled' : 'disabled',
      data: null,
    };
  }

  private _getSlotLimit(input: ScenarioCheckInput) {
    if (!input || !input.site || !input.site.id) {
      throw Error('No site input specified');
    }

    const armSiteDescriptor = new ArmSiteDescriptor(input.site.id);
    return this._quotaService
      .getQuotaLimit(
        armSiteDescriptor.subscription,
        QuotaNames.numberOfSlotsPerSite,
        input.site.properties.sku,
        input.site.properties.computeMode
      )
      .then(limit => {
        return {
          status: 'enabled',
          data: limit,
        } as ScenarioResult;
      });
  }
}
