import { isWorkflowApp } from '../arm-utils';

import { FunctionAppEnvironment } from './function-app.environment';
import { ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './scenario-ids';
export class WorkflowAppEnvironment extends FunctionAppEnvironment {
  public name = 'WorkflowApp';

  constructor() {
    super();

    this.scenarioChecks[ScenarioIds.runtimeScaleMonitoringSupported] = {
      id: ScenarioIds.runtimeScaleMonitoringSupported,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.showRuntimeVersionSetting] = {
      id: ScenarioIds.showRuntimeVersionSetting,
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

    this.scenarioChecks[ScenarioIds.clientAffinitySupported] = {
      id: ScenarioIds.clientAffinitySupported,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.enableMinCipherSuite] = {
      id: ScenarioIds.clientAffinitySupported,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.incomingClientCertSupported] = {
      id: ScenarioIds.incomingClientCertSupported,
      runCheck: () => ({ status: 'disabled' }),
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return isWorkflowApp(input.site);
    }

    return false;
  }
}
