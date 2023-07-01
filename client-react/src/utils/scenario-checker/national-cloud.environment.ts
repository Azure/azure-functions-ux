import Url from '../url';

import { CommonConstants } from './../CommonConstants';
import { AzureEnvironment } from './azure.environment';
import { ScenarioResult } from './scenario.models';
import { ScenarioIds } from './scenario-ids';

export class NationalCloudEnvironment extends AzureEnvironment {
  public static isNationalCloud() {
    return this.isMooncake() || this.isFairFax() || this.isUSNat() || this.isUSSec();
  }

  public static isFairFax() {
    return this._getUrlForNationalCloudEnvironment().toLowerCase() === CommonConstants.NationalCloudArmUris.fairfax.toLowerCase();
  }

  public static isMooncake() {
    return this._getUrlForNationalCloudEnvironment().toLowerCase() === CommonConstants.NationalCloudArmUris.mooncake.toLowerCase();
  }

  public static isUSNat() {
    return this._getUrlForNationalCloudEnvironment().toLowerCase() === CommonConstants.NationalCloudArmUris.usNat.toLowerCase();
  }

  public static isUSSec() {
    return this._getUrlForNationalCloudEnvironment().toLowerCase() === CommonConstants.NationalCloudArmUris.usSec.toLowerCase();
  }

  private static _getUrlForNationalCloudEnvironment() {
    return (window.appsvc && window.appsvc.env && window.appsvc.env.azureResourceManagerEndpoint) || '';
  }

  public name = 'NationalCloud';
  public disabledBindings: string[] = ['apiHubFile', 'apiHubTable', 'apiHubFileTrigger', 'eventGridTrigger'];

  constructor(t: (string) => string) {
    super(t);
    this.scenarioChecks[ScenarioIds.addResourceExplorer] = {
      id: ScenarioIds.addResourceExplorer,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addPushNotifications] = {
      id: ScenarioIds.addPushNotifications,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addTinfoil] = {
      id: ScenarioIds.addTinfoil,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addLogicApps] = {
      id: ScenarioIds.addLogicApps,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.appInsightsConfigurable] = {
      id: ScenarioIds.appInsightsConfigurable,
      runCheckAsync: () => {
        return Promise.resolve<ScenarioResult>({
          status: 'disabled',
          data: null,
        });
      },
    };

    this.scenarioChecks[ScenarioIds.deploymentCenter] = {
      id: ScenarioIds.deploymentCenter,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableExportToPowerApps] = {
      id: ScenarioIds.enableExportToPowerApps,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.disabledBindings] = {
      id: ScenarioIds.disabledBindings,
      runCheck: () => {
        return this.getDisabledBindings();
      },
    };

    this.scenarioChecks[ScenarioIds.addDiagnoseAndSolve] = {
      id: ScenarioIds.addDiagnoseAndSolve,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.externalSource] = {
      id: ScenarioIds.externalSource,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.githubSource] = {
      id: ScenarioIds.githubSource,
      runCheck: () => {
        if (Url.getFeatureValue(CommonConstants.FeatureFlags.enableGitHubOnNationalCloud)) {
          return { status: 'enabled' };
        } else {
          return { status: 'disabled' };
        }
      },
    };
    this.scenarioChecks[ScenarioIds.bitbucketSource] = {
      id: ScenarioIds.bitbucketSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.vstsSource] = {
      id: ScenarioIds.vstsSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.vstsKuduSource] = {
      id: ScenarioIds.vstsKuduSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.showAppInsightsLogs] = {
      id: ScenarioIds.showAppInsightsLogs,
      runCheck: () => {
        return {
          status: NationalCloudEnvironment.isUSNat() || NationalCloudEnvironment.isUSSec() ? 'disabled' : 'enabled',
        };
      },
    };
  }

  public isCurrentEnvironment(): boolean {
    return NationalCloudEnvironment.isNationalCloud();
  }

  private getDisabledBindings(): ScenarioResult {
    return {
      status: 'enabled',
      data: this.disabledBindings,
    };
  }
}
