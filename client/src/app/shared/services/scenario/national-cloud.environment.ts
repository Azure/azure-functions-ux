import { NationalCloudArmUris, ScenarioIds, FeatureFlags } from './../../models/constants';
import { AzureEnvironment } from './azure.environment';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Url } from 'app/shared/Utilities/url';

export class NationalCloudEnvironment extends AzureEnvironment {
  name = 'NationalCloud';
  disabledBindings: string[] = ['apiHubFile', 'apiHubTable', 'apiHubFileTrigger'];

  public static isNationalCloud() {
    return this.isMooncake() || this.isFairFax() || this.isBlackforest();
  }

  public static isFairFax() {
    return window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.fairfax.toLowerCase();
  }

  public static isMooncake() {
    return window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.mooncake.toLowerCase();
  }

  public static isBlackforest() {
    return window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.blackforest.toLowerCase();
  }

  public static isUSNat() {
    return window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.usNat.toLowerCase();
  }

  public static isUSSec() {
    return window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.usSec.toLowerCase();
  }

  constructor(injector: Injector) {
    super(injector);

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
        if (
          NationalCloudEnvironment.isFairFax() ||
          NationalCloudEnvironment.isMooncake() ||
          NationalCloudEnvironment.isBlackforest() ||
          NationalCloudEnvironment.isUSNat() ||
          NationalCloudEnvironment.isUSSec() ||
          !Url.getFeatureValue(FeatureFlags.EnableAIOnNationalCloud)
        ) {
          return Observable.of<ScenarioResult>({
            status: 'disabled',
            data: null,
          });
        } else {
          return this._getApplicationInsightsId(input);
        }
      },
    };

    this.scenarioChecks[ScenarioIds.vstsDeploymentHide] = {
      id: ScenarioIds.vstsDeploymentHide,
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
        return this._getDisabledBindings();
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

    this.scenarioChecks[ScenarioIds.byosSupported] = {
      id: ScenarioIds.byosSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.configureAADSupported] = {
      id: ScenarioIds.configureAADSupported,
      runCheckAsync: (input: ScenarioCheckInput) => {
        return Observable.of<ScenarioResult>({
          status: 'disabled',
          data: null,
        });
      },
    };

    this.scenarioChecks[ScenarioIds.enableLinkAPIM] = {
      id: ScenarioIds.enableLinkAPIM,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return NationalCloudEnvironment.isNationalCloud();
  }

  private _getDisabledBindings() {
    return <ScenarioResult>{
      status: 'enabled',
      data: this.disabledBindings,
    };
  }
}
