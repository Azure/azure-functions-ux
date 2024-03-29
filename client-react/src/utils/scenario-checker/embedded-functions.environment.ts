import { ScenarioIds } from './scenario-ids';
import { Environment } from './scenario.models';
export class EmbeddedFunctionsEnvironment extends Environment {
  public name = 'Embedded';

  constructor() {
    super();
    this.scenarioChecks[ScenarioIds.showSideNavMenu] = {
      id: ScenarioIds.showSideNavMenu,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addTopLevelAppsNode] = {
      id: ScenarioIds.addTopLevelAppsNode,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(): boolean {
    return false;
  }
}
