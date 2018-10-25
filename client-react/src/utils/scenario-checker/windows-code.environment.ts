import { ScenarioCheckInput, Environment } from './scenario.models';
import { ScenarioIds } from './scenario-ids';

export class WindowsCode extends Environment {
  public name = 'WindowCode';

  constructor() {
    super();
    this.scenarioChecks[ScenarioIds.windowsAppStack] = {
      id: ScenarioIds.windowsAppStack,
      runCheck: () => {
        return {
          status: 'enabled',
        };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return !!input && !!input.site && input.site.kind!.toLowerCase() === 'app';
  }
}
