import { TranslateService } from '@ngx-translate/core';
import { ScenarioIds } from './../../models/constants';
import { PortalResources } from './../../models/portal-resources';
import { Environment, ScenarioCheckInput, ScenarioResult } from './scenario.models';

export class LinuxSiteEnvironment extends Environment {
  name = 'LinuxSite';

  constructor(translateService: TranslateService) {
    super();

    const disabledResult: ScenarioResult = {
      status: 'disabled',
      data: translateService.instant(PortalResources.featureNotSupportedForLinuxApps),
    };

    this.scenarioChecks[ScenarioIds.enableBackups] = {
      id: ScenarioIds.enableBackups,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enablePushNotifications] = {
      id: ScenarioIds.enablePushNotifications,
      runCheck: () => disabledResult,
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
      runCheck: () => ({
        status: 'disabled',
      }),
    };

    this.scenarioChecks[ScenarioIds.onedriveSource] = {
      id: ScenarioIds.onedriveSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.dropboxSource] = {
      id: ScenarioIds.dropboxSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.externalSource] = {
      id: ScenarioIds.externalSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.addWebServerLogging] = {
      id: ScenarioIds.addWebServerLogging,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.enableGitHubAction] = {
      id: ScenarioIds.enableGitHubAction,
      runCheck: () => ({ status: 'enabled' }),
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return input.site.kind && input.site.kind.toLowerCase().indexOf('linux') > -1;
    }

    return false;
  }
}
