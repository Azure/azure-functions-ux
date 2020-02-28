import { ScenarioIds } from './../../models/constants';
import { Tier } from './../../models/serverFarmSku';
import { PortalResources } from './../../models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { Environment } from './scenario.models';
import { Injector } from '@angular/core';

export class XenonSiteEnvironment extends Environment {
  name = 'XenonSite';
  private _translateService: TranslateService;

  constructor(injector: Injector) {
    super();
    this._translateService = injector.get(TranslateService);

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

    this.scenarioChecks[ScenarioIds.webSocketsSupported] = {
      id: ScenarioIds.webSocketsSupported,
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

    this.scenarioChecks[ScenarioIds.remoteDebuggingSupported] = {
      id: ScenarioIds.remoteDebuggingSupported,
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
        return <ScenarioResult>{
          status: winFxVersionStartsWithDocker ? 'disabled' : 'enabled',
          data: null,
        };
      },
    };

    this.scenarioChecks[ScenarioIds.enableAutoSwap] = {
      id: ScenarioIds.enableAutoSwap,
      runCheck: (input: ScenarioCheckInput) => {
        const scenarioResult = this._enableIfStandardOrHigher(input);
        scenarioResult.data = this._translateService.instant(PortalResources.autoSwapUpsell);
        return scenarioResult;
      },
    };

    this.scenarioChecks[ScenarioIds.addMsi] = {
      id: ScenarioIds.addMsi,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableLinkAPIM] = {
      id: ScenarioIds.enableLinkAPIM,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  private _enableIfStandardOrHigher(input: ScenarioCheckInput) {
    const disabled =
      input &&
      input.site &&
      (input.site.properties.sku === Tier.free || input.site.properties.sku === Tier.shared || input.site.properties.sku === Tier.basic);

    return <ScenarioResult>{
      status: disabled ? 'disabled' : 'enabled',
      data: null,
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return input.site.properties && input.site.properties.hyperV;
    }

    return false;
  }
}
