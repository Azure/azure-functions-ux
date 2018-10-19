import { ScenarioCheckInput, Environment } from './scenario.models';
import { ScenarioIds } from './scenario-ids';
import { isLinuxDynamic } from '../../utils/arm-utils';

export class DynamicLinuxEnvironment extends Environment {
  public name = 'DynamicLinux';

  constructor() {
    super();
    this.scenarioChecks[ScenarioIds.listExtensionsArm] = {
      id: ScenarioIds.listExtensionsArm,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return isLinuxDynamic(input.site);
    }

    return false;
  }
}
