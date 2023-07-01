import { isLinuxDynamic } from '../arm-utils';

import { Environment, ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './scenario-ids';

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

    this.scenarioChecks[ScenarioIds.deploymentCenter] = {
      id: ScenarioIds.deploymentCenter,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.deploymentCenterLogs] = {
      id: ScenarioIds.deploymentCenterLogs,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.externalSource] = {
      id: ScenarioIds.externalSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.addMsi] = {
      id: ScenarioIds.addMsi,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.showGeneralSettings] = {
      id: ScenarioIds.showGeneralSettings,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableAuth] = {
      id: ScenarioIds.enableAuth,
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
