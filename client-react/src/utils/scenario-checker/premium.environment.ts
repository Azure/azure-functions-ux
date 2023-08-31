import { isIsolatedV2, isPremium } from '../arm-utils';
import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
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
      return isPremium(input.site) || isIsolatedV2(input.site);
    }
    return false;
  }
}
