import { Tier } from './../../models/serverFarmSku';
import { ScenarioCheckInput } from './scenario.models';
import { Environment } from './scenario.models';
import { Kinds, ScenarioIds } from 'app/shared/models/constants';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { TranslateService } from '@ngx-translate/core';
import { Injector } from '@angular/core';
import { PortalResources } from 'app/shared/models/portal-resources';

export class FunctionAppEnvironment extends Environment {
  name = 'FunctionApp';
  private _ts: TranslateService;

  constructor(injector: Injector) {
    super();
    this._ts = injector.get(TranslateService);

    this.scenarioChecks[ScenarioIds.enableDiagnosticLogs] = {
      id: ScenarioIds.enableDiagnosticLogs,
      runCheck: (input: ScenarioCheckInput) => {
        if (input.site.kind && input.site.kind.toLowerCase().indexOf(Kinds.linux) > -1 && !this._isDynamic(input.site)) {
          return null;
        }

        return {
          status: 'disabled',
          data: this._ts.instant(PortalResources.diagnosticLogsDisabled),
        };
      },
    };

    this.scenarioChecks[ScenarioIds.vstsDeploymentHide] = {
      id: ScenarioIds.vstsDeploymentHide,
      runCheck: (input: ScenarioCheckInput) => {
        if (this._isLinux(input.site)) {
          return { status: 'disabled' };
        }

        return null;
      },
    };

    this.scenarioChecks[ScenarioIds.byosSupported] = {
      id: ScenarioIds.byosSupported,
      runCheck: (input: ScenarioCheckInput) => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableBackups] = {
      id: ScenarioIds.enableBackups,
      runCheck: (input?: ScenarioCheckInput) => {
        if (this._isPremium(input.site)) {
          return {
            status: 'disabled',
            data: this._ts.instant(PortalResources.featureNotSupportedForPremium),
          };
        } else {
          return null;
        }
      },
    };

    this.scenarioChecks[ScenarioIds.tipSupported] = {
      id: ScenarioIds.tipSupported,
      runCheck: (input: ScenarioCheckInput) => {
        if (this._isDynamic(input.site)) {
          return { status: 'disabled' };
        }

        return null;
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return input.site.kind && input.site.kind.toLowerCase().includes(Kinds.functionApp);
    }

    return false;
  }

  private _isLinux(site: ArmObj<Site>) {
    return site.kind && site.kind.toLowerCase().includes(Kinds.linux);
  }

  private _isDynamic(site: ArmObj<Site>) {
    return site.properties.sku.toLowerCase() === Tier.dynamic.toLowerCase();
  }

  private _isPremium(site: ArmObj<Site>): boolean {
    const siteSku = site.properties.sku && site.properties.sku.toLocaleLowerCase();
    const premiumSkuTiers = [
      Tier.premium.toLocaleLowerCase(),
      Tier.premiumV2.toLocaleLowerCase(),
      Tier.premiumContainer.toLocaleLowerCase(),
      Tier.elasticPremium.toLocaleLowerCase(),
    ];

    return premiumSkuTiers.findIndex(sku => sku === siteSku) > -1;
  }
}
