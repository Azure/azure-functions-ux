import { ScenarioCheckInput, Environment } from './scenario.models';
import { ScenarioIds } from './scenario-ids';

export class FunctionAppEnvironment extends Environment {
  public name = 'DynamicSite';

  constructor() {
    super();
    this.scenarioChecks[ScenarioIds.vstsDeploymentHide] = {
      id: ScenarioIds.vstsDeploymentHide,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return input.site.kind!.toLowerCase().includes('functionapp');
    }

    return false;
  }
}
