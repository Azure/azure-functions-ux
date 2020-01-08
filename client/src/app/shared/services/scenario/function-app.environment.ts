import { Tier } from './../../models/serverFarmSku';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { Environment } from './scenario.models';
import { Kinds, ScenarioIds, FeatureFlags } from 'app/shared/models/constants';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { Url } from 'app/shared/Utilities/url';
import { TranslateService } from '@ngx-translate/core';
import { Injector } from '@angular/core';
import { AuthzService } from '../authz.service';
import { Observable } from 'rxjs';
import { PortalResources } from 'app/shared/models/portal-resources';

export class FunctionAppEnvironment extends Environment {
  name = 'FunctionApp';
  private _ts: TranslateService;
  private _authZService: AuthzService;

  constructor(injector: Injector) {
    super();
    this._ts = injector.get(TranslateService);
    this._authZService = injector.get(AuthzService);

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

    const IsPublishProfileBasedDeploymentEnabled = Url.getFeatureValue(FeatureFlags.enablePublishProfileBasedDeploymentForFunctionApp);
    this.scenarioChecks[ScenarioIds.isPublishProfileBasedDeploymentForFunctionAppEnabled] = {
      id: ScenarioIds.isPublishProfileBasedDeploymentForFunctionAppEnabled,
      runCheck: () =>
        <ScenarioResult>{
          status: IsPublishProfileBasedDeploymentEnabled ? 'enabled' : 'disabled',
          data: null,
        },
    };

    this.scenarioChecks[ScenarioIds.hasRoleAssignmentPermission] = {
      id: ScenarioIds.hasRoleAssignmentPermission,
      runCheckAsync: (input: ScenarioCheckInput) => this._hasRoleAssignmentPermissionCheck(input),
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

  private _hasRoleAssignmentPermissionCheck(input: ScenarioCheckInput): Observable<ScenarioResult> {
    return this._authZService.hasPermission(input.site.id, [AuthzService.activeDirectoryWriteScope]).map(value => {
      return <ScenarioResult>{
        status: value ? 'enabled' : 'disabled',
        data: {
          errorMessage: this._ts.instant(PortalResources.vsts_permissions_error),
        },
      };
    });
  }
}
