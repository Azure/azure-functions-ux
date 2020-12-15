import Url from '../url';
import { CommonConstants } from './../CommonConstants';
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
    if (Url.getFeatureValue(CommonConstants.FeatureFlags.enableAzureMount)) {
      this.scenarioChecks[ScenarioIds.azureStorageMount] = {
        id: ScenarioIds.azureStorageMount,
        runCheck: () => {
          return {
            status: 'enabled',
          };
        },
      };
    }
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return (
      !!input &&
      !!input.site &&
      !!input.site.kind &&
      (input.site.kind.toLowerCase() === CommonConstants.Kinds.app || input.site.kind.toLowerCase() === CommonConstants.Kinds.api)
    );
  }
}
