import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
import { isContainerApp, isLinuxApp } from '../arm-utils';
import { NationalCloudEnvironment } from './national-cloud.environment';

export class ContainerApp extends Environment {
  public name = 'ContainerApp';

  constructor() {
    super();

    this.scenarioChecks[ScenarioIds.deploymentCenter] = {
      id: ScenarioIds.deploymentCenter,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
    this.scenarioChecks[ScenarioIds.linuxAppRuntime] = {
      id: ScenarioIds.linuxAppRuntime,
      runCheck: () => {
        return {
          status: 'disabled',
        };
      },
    };
    this.scenarioChecks[ScenarioIds.azureStorageMount] = {
      id: ScenarioIds.azureStorageMount,
      runCheck: () => {
        return {
          status: 'enabled',
        };
      },
    };
    this.scenarioChecks[ScenarioIds.azureStorageMountPreview] = {
      id: ScenarioIds.azureStorageMountPreview,
      runCheck: () => {
        return {
          status: NationalCloudEnvironment.isNationalCloud() ? 'enabled' : 'disabled',
        };
      },
    };
    this.scenarioChecks[ScenarioIds.azureBlobMount] = {
      id: ScenarioIds.azureBlobMount,
      runCheck: input => {
        return {
          status: !!input && !!input.site && isLinuxApp(input.site) ? 'enabled' : 'disabled',
        };
      },
    };
    this.scenarioChecks[ScenarioIds.linuxRemoteDebuggingSupported] = {
      id: ScenarioIds.linuxRemoteDebuggingSupported,
      runCheck: () => {
        return {
          status: 'disabled',
        };
      },
    };
    this.scenarioChecks[ScenarioIds.dockerCompose] = {
      id: ScenarioIds.dockerCompose,
      runCheck: (input: ScenarioCheckInput) => {
        if (input && input.site && isLinuxApp(input.site)) {
          return { status: 'enabled' };
        } else {
          return { status: 'disabled' };
        }
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return isContainerApp(input.site);
    }

    return false;
  }
}
