import { isPremiumV1, isPremiumV2, isPremiumV3 } from '../arm-utils';
import { CommonConstants } from '../CommonConstants';
import Url from '../url';
import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
export class PremiumAppEnvironment extends Environment {
  public name = 'PremiumApp';

  constructor() {
    super();

    this.scenarioChecks[ScenarioIds.enableMinCipherSuite] = {
      id: ScenarioIds.enableMinCipherSuite,
      runCheck: () => ({
        status: Url.getFeatureValue(CommonConstants.FeatureFlags.enableMinTLSCipherSuites) === 'true' ? 'enabled' : 'disabled',
      }),
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input?.site) {
      return isPremiumV2(input.site) || isPremiumV1(input.site) || isPremiumV3(input.site);
    }
    return false;
  }
}
