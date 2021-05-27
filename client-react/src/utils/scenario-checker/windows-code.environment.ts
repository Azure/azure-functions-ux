import { isContainerApp, isWindowsCode } from '../arm-utils';
import { CommonConstants } from '../CommonConstants';
import Url from '../url';
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
          status: Url.getFeatureValue(CommonConstants.FeatureFlags.enableAzureMount) ? 'enabled' : 'disabled',
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
