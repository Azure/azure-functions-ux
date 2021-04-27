import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
import { isKubeApp } from '../arm-utils';
import { CommonConstants } from '../CommonConstants';
import Url from '../url';

export class KubeApp extends Environment {
  public name = 'KubeApp';

  constructor(t: (string) => string) {
    super();

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

    this.scenarioChecks[ScenarioIds.ftpSource] = {
      id: ScenarioIds.ftpSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.localGitSource] = {
      id: ScenarioIds.localGitSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.kuduBuildProvider] = {
      id: ScenarioIds.kuduBuildProvider,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.azurePipelinesBuildProvider] = {
      id: ScenarioIds.azurePipelinesBuildProvider,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.virtualDirectoriesSupported] = {
      id: ScenarioIds.virtualDirectoriesSupported,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.azureStorageMount] = {
      id: ScenarioIds.azureStorageMount,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.linuxRemoteDebuggingSupported] = {
      id: ScenarioIds.linuxRemoteDebuggingSupported,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.windowsRemoteDebuggingSupported] = {
      id: ScenarioIds.windowsRemoteDebuggingSupported,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.incomingClientCertEnabled] = {
      id: ScenarioIds.incomingClientCertEnabled,
      runCheck: () => ({
        status: Url.getFeatureValue(CommonConstants.FeatureFlags.enableKubeScenarioForTesting) === 'true' ? 'enabled' : 'disabled',
      }),
    };

    this.scenarioChecks[ScenarioIds.webSocketsSupported] = {
      id: ScenarioIds.webSocketsSupported,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.alwaysOnSupported] = {
      id: ScenarioIds.alwaysOnSupported,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.ftpStateSupported] = {
      id: ScenarioIds.ftpStateSupported,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.incomingClientCertSupported] = {
      id: ScenarioIds.incomingClientCertSupported,
      runCheck: () => ({
        status: Url.getFeatureValue(CommonConstants.FeatureFlags.enableKubeScenarioForTesting) === 'true' ? 'enabled' : 'disabled',
      }),
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return isKubeApp(input.site);
    }

    return false;
  }
}
