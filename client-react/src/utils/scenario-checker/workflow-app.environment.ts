import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput } from './scenario.models';
import { FunctionAppEnvironment } from './function-app.environment';
import { isWorkflowApp } from '../arm-utils';
export class WorkflowAppEnvironment extends FunctionAppEnvironment {
  public name = 'WorkflowApp';

  constructor(t: (string) => string) {
    super(t);

    this.scenarioChecks[ScenarioIds.showFunctionRuntimeSettings] = {
      id: ScenarioIds.showFunctionRuntimeSettings,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return isWorkflowApp(input.site);
    }

    return false;
  }
}
