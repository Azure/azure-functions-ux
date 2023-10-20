import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
import { isFlexConsumption } from '../arm-utils';

export class FlexConsumptionEnvironment extends Environment {
  public name = 'FlexConsumption';

  constructor() {
    super();

    this.scenarioChecks[ScenarioIds.showGeneralSettings] = {
      id: ScenarioIds.showGeneralSettings,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return input && input.site && isFlexConsumption(input.site)
  }
}
