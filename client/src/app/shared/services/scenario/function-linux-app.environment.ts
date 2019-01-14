import { ScenarioCheckInput } from './scenario.models';
import { Environment } from './scenario.models';
import { Kinds, ScenarioIds } from 'app/shared/models/constants';

export class FunctionLinuxAppEnvironment extends Environment {
  name = 'FunctionLinuxApp';

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
      return input.site.kind.toLowerCase().includes(Kinds.functionApp) && input.site.kind.toLowerCase().includes(Kinds.linux);
    }

    return false;
  }
}
