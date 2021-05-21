import { isWindowsCode } from '../arm-utils';
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
    this.scenarioChecks[ScenarioIds.azureStorageMount] = {
      id: ScenarioIds.azureStorageMount,
      runCheck: () => {
        return {
          status: 'enabled',
        };
      },
    };

    this.scenarioChecks[ScenarioIds.azureBlobMount] = {
      id: ScenarioIds.azureBlobMount,
      runCheck: () => {
        return {
          status: 'disabled',
        };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return !!input && !!input.site && !!input.site.kind && isWindowsCode(input.site);
  }
}
