import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput } from './scenario.models';
import { FunctionAppEnvironment } from './function-app.environment';
import { isWorkflowApp } from '../arm-utils';
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

    this.scenarioChecks[ScenarioIds.alwaysOnSupported] = {
      id: ScenarioIds.alwaysOnSupported,
      runCheck: input => {
        if (input && input.site && input.site.properties && input.site.properties.sku) {
          const { sku } = input.site.properties;
          if (
            sku.toLowerCase() === 'workflowstandard' ||
            sku.toLowerCase() === 'elasticpremium' ||
            sku.toLowerCase() === 'elasticisolated'
          ) {
            return { status: 'disabled' };
          } else {
            return { status: 'enabled' };
          }
        }
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.clientAffinitySupported] = {
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
