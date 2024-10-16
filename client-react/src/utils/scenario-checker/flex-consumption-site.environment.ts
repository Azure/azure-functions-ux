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

    this.scenarioChecks[ScenarioIds.ftpBasicAuthSupported] = {
      id: ScenarioIds.ftpBasicAuthSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.http20ProxySupported] = {
      id: ScenarioIds.http20ProxySupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.alwaysOnSupported] = {
      id: ScenarioIds.alwaysOnSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.windowsRemoteDebuggingSupported] = {
      id: ScenarioIds.windowsRemoteDebuggingSupported,
      runCheck: () => {
        return {
          status: 'disabled',
        };
      },
    };

    this.scenarioChecks[ScenarioIds.linuxRemoteDebuggingSupported] = {
      id: ScenarioIds.linuxRemoteDebuggingSupported,
      runCheck: () => {
        return {
          status: 'disabled',
        };
      },
    };

    this.scenarioChecks[ScenarioIds.showFunctionRuntimeSettings] = {
      id: ScenarioIds.showFunctionRuntimeSettings,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return !!input && !!input.site && isFlexConsumption(input.site);
  }
}
