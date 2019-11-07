import { TranslateService } from '@ngx-translate/core';
import { ScenarioIds } from './../../models/constants';
import { PortalResources } from './../../models/portal-resources';
import { ArmUtil } from '../../Utilities/arm-utils';
import { Environment, ScenarioCheckInput, ScenarioResult } from './scenario.models';

export class DynamicLinuxEnvironment extends Environment {
  name = 'DynamicLinux';

  constructor(translateService: TranslateService) {
    super();

    const disabledResult: ScenarioResult = {
      status: 'disabled',
      data: translateService.instant(PortalResources.featureNotSupportedForLinuxConsumptionApps),
    };

    const enabledResult: ScenarioResult = {
      status: 'enabled',
    };

    this.scenarioChecks[ScenarioIds.listExtensionsArm] = {
      id: ScenarioIds.listExtensionsArm,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.deploymentCenter] = {
      id: ScenarioIds.deploymentCenter,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableConsole] = {
      id: ScenarioIds.enableConsole,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableKudu] = {
      id: ScenarioIds.enableKudu,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableLogStream] = {
      id: ScenarioIds.enableLogStream,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableMetrics] = {
      id: ScenarioIds.enableMetrics,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableCORS] = {
      id: ScenarioIds.enableCORS,
      runCheck: () => enabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableQuotas] = {
      id: ScenarioIds.enableQuotas,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableAuth] = {
      id: ScenarioIds.enableAuth,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.enableFunctionLogStreaming] = {
      id: ScenarioIds.enableFunctionLogStreaming,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.containerSettings] = {
      id: ScenarioIds.containerSettings,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return ArmUtil.isLinuxDynamic(input.site);
    }

    return false;
  }
}
