import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
export class EmbeddedFunctionsEnvironment extends Environment {
  public name = 'Embedded';

  constructor(t: (string) => string) {
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

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return false;
  }
}
