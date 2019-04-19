import { ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from './scenario.models';
import { ArmUtil } from '../../Utilities/arm-utils';

export class DynamicLinuxEnvironment extends Environment {
  name = 'DynamicLinux';

  constructor() {
    super();

    this.scenarioChecks[ScenarioIds.deploymentCenter] = {
      id: ScenarioIds.deploymentCenter,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableLinkAPIM] = {
      id: ScenarioIds.enableLinkAPIM,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return ArmUtil.isContainerApp(input.site);
    }

    return false;
  }
}
