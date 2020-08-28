import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput } from './scenario.models';
import { FunctionAppEnvironment } from './function-app.environment';
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
    if (input && input.site && input.site.kind) {
      return input.site.kind.toLowerCase().includes('functionapp,workflowapp');
    }

    return false;
  }
}
