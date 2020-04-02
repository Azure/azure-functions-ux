import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { AzureEnvironment } from './azure.environment';

export class NationalCloudEnvironment extends AzureEnvironment {
  public static isNationalCloud() {
    return this.isMooncake() || this.isFairFax() || this.isBlackforest();
  }

  public static isFairFax() {
    return process.env.REACT_APP_RUNETIME_TYPE === 'fairfax';
  }

  public static isMooncake() {
    return process.env.REACT_APP_RUNETIME_TYPE === 'mooncake';
  }

  public static isBlackforest() {
    return process.env.REACT_APP_RUNETIME_TYPE === 'blackforest';
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
      runCheckAsync: (input: ScenarioCheckInput) => {
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

    this.scenarioChecks[ScenarioIds.addFTPOptions] = {
      id: ScenarioIds.addFTPOptions,
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

    this.scenarioChecks[ScenarioIds.addHTTPSwitch] = {
      id: ScenarioIds.addHTTPSwitch,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.onedriveSource] = {
      id: ScenarioIds.onedriveSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.dropboxSource] = {
      id: ScenarioIds.dropboxSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.externalSource] = {
      id: ScenarioIds.externalSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.githubSource] = {
      id: ScenarioIds.githubSource,
      runCheck: () => ({ status: 'disabled' }),
    };
    this.scenarioChecks[ScenarioIds.bitbucketSource] = {
      id: ScenarioIds.bitbucketSource,
      runCheck: () => ({ status: 'disabled' }),
    };
    this.scenarioChecks[ScenarioIds.vstsSource] = {
      id: ScenarioIds.vstsSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.showAppInsightsLogs] = {
      id: ScenarioIds.showAppInsightsLogs,
      runCheck: () => {
        return { status: NationalCloudEnvironment.isBlackforest() ? 'disabled' : 'enabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return NationalCloudEnvironment.isNationalCloud();
  }

  private getDisabledBindings(): ScenarioResult {
    return {
      status: 'enabled',
      data: this.disabledBindings,
    };
  }
}
