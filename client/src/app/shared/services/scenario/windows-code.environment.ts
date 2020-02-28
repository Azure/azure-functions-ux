import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { ScenarioIds, Kinds, FeatureFlags } from '../../models/constants';
import { Environment } from './scenario.models';
import { Url } from 'app/shared/Utilities/url';
import { Observable } from 'rxjs';
import { AuthzService } from '../authz.service';
import { PortalResources } from 'app/shared/models/portal-resources';
import { Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export class WindowsCodeEnvironment extends Environment {
  name = 'WindowsCode';
  private _translateService: TranslateService;
  private _authZService: AuthzService;

  constructor(injector: Injector) {
    super();
    this._translateService = injector.get(TranslateService);
    this._authZService = injector.get(AuthzService);

    const disabledResult: ScenarioResult = {
      status: 'disabled',
      data: null,
    };

    this.scenarioChecks[ScenarioIds.byosSupported] = {
      id: ScenarioIds.byosSupported,
      runCheck: () => disabledResult,
    };

    let IsPublishProfileBasedDeploymentEnabled = Url.getFeatureValue(FeatureFlags.enablePublishProfileBasedDeployment);
    //Enabling FF
    IsPublishProfileBasedDeploymentEnabled = 'true';
    this.scenarioChecks[ScenarioIds.isPublishProfileBasedDeploymentEnabled] = {
      id: ScenarioIds.isPublishProfileBasedDeploymentEnabled,
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

    this.scenarioChecks[ScenarioIds.enableGitHubAction] = {
      id: ScenarioIds.enableGitHubAction,
      runCheck: () => ({ status: 'enabled' }),
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return (
      !!input &&
      !!input.site &&
      (input.site.kind!.toLowerCase() === Kinds.app.toLowerCase() || input.site.kind!.toLowerCase() === Kinds.api.toLowerCase())
    );
  }

  private _hasRoleAssignmentPermissionCheck(input: ScenarioCheckInput): Observable<ScenarioResult> {
    return this._authZService.hasPermission(input.site.id, [AuthzService.activeDirectoryWriteScope]).map(value => {
      return <ScenarioResult>{
        status: value ? 'enabled' : 'disabled',
        data: {
          errorMessage: this._translateService.instant(PortalResources.vsts_permissions_error),
        },
      };
    });
  }
}
