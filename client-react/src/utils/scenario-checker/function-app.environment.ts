import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
export class FunctionAppEnvironment extends Environment {
  public name = 'FunctionApp';

  constructor(t: (string) => string) {
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

    this.scenarioChecks[ScenarioIds.showFunctionRuntimeSettings] = {
      id: ScenarioIds.showFunctionRuntimeSettings,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site && input.site.kind) {
      return input.site.kind.toLowerCase().includes('functionapp');
    }

    return false;
  }
}
