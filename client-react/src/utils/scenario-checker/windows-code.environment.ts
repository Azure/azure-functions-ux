import { isWindowsCode } from '../arm-utils';
import { CommonConstants } from '../CommonConstants';
import Url from '../url';
import { ScenarioIds } from './scenario-ids';
import { Environment, ScenarioCheckInput } from './scenario.models';
import { NationalCloudEnvironment } from './national-cloud.environment';

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
          status: this._getAzureStorageMountAvailability(),
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

  private _getAzureStorageMountAvailability = () => {
    return Url.getFeatureValue(CommonConstants.FeatureFlags.enableAzureMount) || !NationalCloudEnvironment.isNationalCloud()
      ? 'enabled'
      : 'disabled';
  };

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return !!input && !!input.site && !!input.site.kind && isWindowsCode(input.site);
  }
}
