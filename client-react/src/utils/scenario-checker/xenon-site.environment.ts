import { ScenarioIds } from './scenario-ids';
import { ServerFarmSkuConstants } from './ServerFarmSku';
import { ScenarioCheckInput, ScenarioResult, Environment } from './scenario.models';

export class XenonSiteEnvironment extends Environment {
  public name = 'XenonSite';

  constructor(t: (string) => string) {
    super();

    const disabledResult: ScenarioResult = {
      status: 'disabled',
      data: null,
    };

    this.scenarioChecks[ScenarioIds.enableTinfoil] = {
      id: ScenarioIds.enableTinfoil,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.dotNetFrameworkSupported] = {
      id: ScenarioIds.dotNetFrameworkSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.platform64BitSupported] = {
      id: ScenarioIds.platform64BitSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.classicPipelineModeSupported] = {
      id: ScenarioIds.classicPipelineModeSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.defaultDocumentsSupported] = {
      id: ScenarioIds.defaultDocumentsSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.virtualDirectoriesSupported] = {
      id: ScenarioIds.virtualDirectoriesSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.handlerMappingsSupported] = {
      id: ScenarioIds.handlerMappingsSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.windowsRemoteDebuggingSupported] = {
      id: ScenarioIds.windowsRemoteDebuggingSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.phpSupported] = {
      id: ScenarioIds.phpSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.pythonSupported] = {
      id: ScenarioIds.pythonSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.javaSupported] = {
      id: ScenarioIds.javaSupported,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.addMsi] = {
      id: ScenarioIds.addMsi,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.azureBlobMount] = {
      id: ScenarioIds.azureBlobMount,
      runCheck: () => disabledResult,
    };

    this.scenarioChecks[ScenarioIds.autoSwapSupported] = {
      id: ScenarioIds.autoSwapSupported,
      runCheck: (input: ScenarioCheckInput) => {
        let winFxVersionStartsWithDocker = false;
        if (
          input &&
          input.site &&
          input.site.properties &&
          input.site.properties.siteProperties &&
          input.site.properties.siteProperties.properties
        ) {
          const winFxVersion = input.site.properties.siteProperties.properties.find(prop => prop.name.toLowerCase() === 'windowsfxversion');
          if (winFxVersion && winFxVersion.value && winFxVersion.value.toLowerCase().startsWith('docker|')) {
            winFxVersionStartsWithDocker = true;
          }
        }
        return {
          status: winFxVersionStartsWithDocker ? 'disabled' : 'enabled',
          data: null,
        };
      },
    };

    this.scenarioChecks[ScenarioIds.enableAutoSwap] = {
      id: ScenarioIds.enableAutoSwap,
      runCheck: (input: ScenarioCheckInput) => {
        const scenarioResult = this.enableIfStandardOrHigher(input);
        scenarioResult.data = t('autoSwapUpsell');
        return scenarioResult;
      },
    };

    this.scenarioChecks[ScenarioIds.xenonAppRuntimeStack] = {
      id: ScenarioIds.xenonAppRuntimeStack,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return input.site.properties && input.site.properties.hyperV;
    }

    return false;
  }

  private enableIfStandardOrHigher(input: ScenarioCheckInput): ScenarioResult {
    const disabled =
      input &&
      input.site &&
      (input.site.properties.sku === ServerFarmSkuConstants.Tier.free ||
        input.site.properties.sku === ServerFarmSkuConstants.Tier.shared ||
        input.site.properties.sku === ServerFarmSkuConstants.Tier.basic);

    return {
      status: disabled ? 'disabled' : 'enabled',
      data: null,
    };
  }
}
