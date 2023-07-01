import { isPremium } from '../arm-utils';

import { Environment, ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './scenario-ids';
export class PremiumAppEnvironment extends Environment {
  public name = 'PremiumApp';

  constructor() {
    super();

    this.scenarioChecks[ScenarioIds.enableMinCipherSuite] = {
      id: ScenarioIds.enableMinCipherSuite,
      runCheck: () => ({
        status: 'enabled',
      }),
    };

    this.scenarioChecks[ScenarioIds.enableCustomErrorPagesOverlay] = {
      id: ScenarioIds.enableCustomErrorPagesOverlay,
      runCheck: () => ({
        status: 'disabled',
      }),
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input?.site) {
      return isPremium(input.site);
    }
    return false;
  }
}
