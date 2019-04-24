import { ScenarioIds } from './scenario-ids';
import { Environment, ScenarioCheckInput } from './scenario.models';

export class WindowsCode extends Environment {
  public name = 'WindowCode';

  constructor(t: (string) => string) {
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
    return (
      !!input && !!input.site && !!input.site.kind && (input.site.kind.toLowerCase() === 'app' || input.site.kind.toLowerCase() === 'api')
    );
  }
}
