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
  name = 'DynamicSite';
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
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return input.site.kind.toLowerCase().includes(Kinds.functionApp);
    }

    return false;
  }

  private _isDynamic(site: ArmObj<Site>) {
    return site.properties.sku.toLowerCase() === Tier.dynamic.toLowerCase();
  }
}
