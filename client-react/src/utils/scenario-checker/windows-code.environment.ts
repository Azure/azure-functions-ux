import { isStandardOrHigher, isWindowsCode } from '../arm-utils';
import { NationalCloudEnvironment } from './national-cloud.environment';
import { ScenarioIds } from './scenario-ids';
import { Environment, ScenarioCheckInput } from './scenario.models';

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

    this.scenarioChecks[ScenarioIds.http20ProxySupported] = {
      id: ScenarioIds.http20ProxySupported,
      runCheck: () => {
        return {
          status: NationalCloudEnvironment.isUSNat() || NationalCloudEnvironment.isUSSec() ? 'disabled' : 'enabled',
        };
      },
    };

    this.scenarioChecks[ScenarioIds.enableE2ETlsEncryption] = {
      id: ScenarioIds.enableE2ETlsEncryption,
      runCheck: (input?: ScenarioCheckInput) => {
        return {
          status: input?.site && isStandardOrHigher(input.site) ? 'enabled' : 'disabled',
        };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return !!input && !!input.site && !!input.site.kind && isWindowsCode(input.site);
  }
}
