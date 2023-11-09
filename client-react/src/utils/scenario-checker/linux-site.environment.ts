import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, ScenarioResult, Environment } from './scenario.models';
import { isLinuxApp, isStandardOrHigher } from '../arm-utils';
import { NationalCloudEnvironment } from './national-cloud.environment';

export class LinuxSiteEnvironment extends Environment {
  public name = 'LinuxSite';

  constructor(t: (string) => string) {
    super();

    const disabledResult: ScenarioResult = {
      status: 'disabled',
      data: t('featureNotSupportedForLinuxApps'),
    };

    this.scenarioChecks[ScenarioIds.classicPipelineModeSupported] = {
      id: ScenarioIds.classicPipelineModeSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableAuth] = {
      id: ScenarioIds.enableAuth,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableBackups] = {
      id: ScenarioIds.enableBackups,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableNetworking] = {
      id: ScenarioIds.enableNetworking,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enablePushNotifications] = {
      id: ScenarioIds.enablePushNotifications,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.addConsole] = {
      id: ScenarioIds.addConsole,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.webSocketsSupported] = {
      id: ScenarioIds.webSocketsSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addSsh] = {
      id: ScenarioIds.addSsh,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableAppServiceEditor] = {
      id: ScenarioIds.enableAppServiceEditor,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableExtensions] = {
      id: ScenarioIds.enableExtensions,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableLogStream] = {
      id: ScenarioIds.enableLogStream,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableProcessExplorer] = {
      id: ScenarioIds.enableProcessExplorer,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableTinfoil] = {
      id: ScenarioIds.enableTinfoil,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.vstsKuduSource] = {
      id: ScenarioIds.vstsKuduSource,
      runCheck: () => ({ status: 'enabled' }),
    };

    this.scenarioChecks[ScenarioIds.externalSource] = {
      id: ScenarioIds.externalSource,
      runCheck: () => ({ status: 'enabled' }),
    };

    this.scenarioChecks[ScenarioIds.addWebServerLogging] = {
      id: ScenarioIds.addWebServerLogging,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.skipStackValidation] = {
      id: ScenarioIds.skipStackValidation,
      runCheck: () => {
        return { status: 'disabled' };
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

    this.scenarioChecks[ScenarioIds.linuxAppStack] = {
      id: ScenarioIds.linuxAppStack,
      runCheck: () => {
        return {
          status: 'enabled',
        };
      },
    };

    this.scenarioChecks[ScenarioIds.platform64BitSupported] = {
      id: ScenarioIds.platform64BitSupported,
      runCheck: () => {
        return {
          status: 'disabled',
        };
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
          status: 'enabled',
        };
      },
    };

    this.scenarioChecks[ScenarioIds.defaultDocumentsSupported] = {
      id: ScenarioIds.windowsRemoteDebuggingSupported,
      runCheck: () => {
        return {
          status: 'disabled',
        };
      },
    };

    this.scenarioChecks[ScenarioIds.virtualDirectoriesSupported] = {
      id: ScenarioIds.virtualDirectoriesSupported,
      runCheck: () => {
        return {
          status: 'disabled',
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

    this.scenarioChecks[ScenarioIds.sshEnabledSupported] = {
      id: ScenarioIds.sshEnabledSupported,
      runCheck: () => ({ status: 'enabled' }),
    };

    this.scenarioChecks[ScenarioIds.enableE2ETlsEncryption] = {
      id: ScenarioIds.enableE2ETlsEncryption,
      runCheck: (input?: ScenarioCheckInput) => {
        return {
          status: input?.site && isStandardOrHigher(input?.site) ? 'enabled' : 'disabled',
        };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return !!input && !!input.site && isLinuxApp(input.site);
  }
}
