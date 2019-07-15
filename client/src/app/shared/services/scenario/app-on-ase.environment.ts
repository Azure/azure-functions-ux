import { TranslateService } from '@ngx-translate/core';
import { SiteService } from 'app/shared/services/site.service';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from './scenario.models';
import { InternalLoadBalancingMode } from 'app/shared/models/arm/hosting-environment';
import { Injector } from '@angular/core';
import { PortalResources } from 'app/shared/models/portal-resources';

export class AppOnAse extends Environment {
  name = 'AppOnAse';
  private _siteService: SiteService;
  private _translateService: TranslateService;

  constructor(injector: Injector) {
    super();
    this._siteService = injector.get(SiteService);
    this._translateService = injector.get(TranslateService);

    this.scenarioChecks[ScenarioIds.enableAppServiceEditor] = {
      id: ScenarioIds.enableAppServiceEditor,
      runCheckAsync: (input: ScenarioCheckInput) => this._runCheckForIlbAse(input),
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return input && input.site && !!input.site.properties.hostingEnvironmentProfile;
  }

  private _runCheckForIlbAse(input: ScenarioCheckInput) {
    return this._siteService.getHostingEnvironment(input.site.properties.hostingEnvironmentProfile.id).map(r => {
      if (r.isSuccessful) {
        const ase = r.result;
        if (ase.properties.internalLoadBalancingMode !== InternalLoadBalancingMode.None) {
          return {
            status: 'disabled',
            data: this._translateService.instant(PortalResources.featureNotSupportedForILBASEApps),
          } as ScenarioResult;
        }
      }
      return {
        status: 'enabled',
      } as ScenarioResult;
    });
  }
}
