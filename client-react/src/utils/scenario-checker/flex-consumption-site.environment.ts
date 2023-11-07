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
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.ftpStateSupported] = {
      id: ScenarioIds.ftpStateSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.classicPipelineModeSupported] = {
      id: ScenarioIds.classicPipelineModeSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.platform64BitSupported] = {
      id: ScenarioIds.platform64BitSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return !!input && !!input.site && isFlexConsumption(input.site);
  }
}
