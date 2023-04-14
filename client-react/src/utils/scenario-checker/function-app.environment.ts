import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
import { isLinuxApp, isLinuxDynamic, isWorkflowApp } from '../arm-utils';
export class FunctionAppEnvironment extends Environment {
  public name = 'FunctionApp';

  constructor() {
    super();
    this.scenarioChecks[ScenarioIds.vstsDeploymentHide] = {
      id: ScenarioIds.vstsDeploymentHide,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.defaultDocumentsSupported] = {
      id: ScenarioIds.defaultDocumentsSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.virtualDirectoriesSupported] = {
      id: ScenarioIds.virtualDirectoriesSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.azureStorageMount] = {
      id: ScenarioIds.azureStorageMount,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableCustomErrorPages] = {
      id: ScenarioIds.enableCustomErrorPages,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.showConnnectionStringFunctionInfo] = {
      id: ScenarioIds.showConnnectionStringFunctionInfo,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.skipStackValidation] = {
      id: ScenarioIds.skipStackValidation,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.functionAppRuntimeStack] = {
      id: ScenarioIds.functionAppRuntimeStack,
      runCheck: () => {
        return { status: 'enabled' };
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

    this.scenarioChecks[ScenarioIds.showFunctionRuntimeSettings] = {
      id: ScenarioIds.showFunctionRuntimeSettings,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.bitbucketSource] = {
      id: ScenarioIds.bitbucketSource,
      runCheck: (input: ScenarioCheckInput) => {
        if (input && input.site && isLinuxDynamic(input.site)) {
          return { status: 'disabled' };
        } else {
          return { status: 'enabled' };
        }
      },
    };

    this.scenarioChecks[ScenarioIds.localGitSource] = {
      id: ScenarioIds.localGitSource,
      runCheck: (input: ScenarioCheckInput) => {
        if (input && input.site && isLinuxDynamic(input.site)) {
          return { status: 'disabled' };
        } else {
          return { status: 'enabled' };
        }
      },
    };

    this.scenarioChecks[ScenarioIds.vstsKuduSource] = {
      id: ScenarioIds.vstsKuduSource,
      runCheck: (input: ScenarioCheckInput) => {
        if (input && input.site && isLinuxApp(input.site)) {
          return { status: 'disabled' };
        } else {
          return { status: 'enabled' };
        }
      },
    };

    this.scenarioChecks[ScenarioIds.externalSource] = {
      id: ScenarioIds.externalSource,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.kuduBuildProvider] = {
      id: ScenarioIds.kuduBuildProvider,
      runCheck: (input: ScenarioCheckInput) => {
        if (input && input.site && isLinuxDynamic(input.site)) {
          return { status: 'disabled' };
        } else {
          return { status: 'enabled' };
        }
      },
    };

    this.scenarioChecks[ScenarioIds.clientAffinitySupported] = {
      id: ScenarioIds.clientAffinitySupported,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.dockerCompose] = {
      id: ScenarioIds.dockerCompose,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site && input.site.kind) {
      return input.site.kind.toLowerCase().includes('functionapp') && !isWorkflowApp(input.site);
    }

    return false;
  }
}
