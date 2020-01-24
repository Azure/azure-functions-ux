import { ScenarioIds, FeatureFlags, Kinds } from './../../models/constants';
import { Tier } from './../../models/serverFarmSku';
import { Observable } from 'rxjs/Observable';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { Environment } from 'app/shared/services/scenario/scenario.models';
import { Injector } from '@angular/core';
import { ApplicationInsightsService } from '../application-insights.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from './../../../shared/models/portal-resources';
import { AuthzService } from '../authz.service';
import { Url } from 'app/shared/Utilities/url';

export class AzureEnvironment extends Environment {
  name = 'Azure';
  private _applicationInsightsService: ApplicationInsightsService;
  private _translateService: TranslateService;
  private _authZService: AuthzService;

  constructor(injector: Injector) {
    super();
    this._applicationInsightsService = injector.get(ApplicationInsightsService);
    this._translateService = injector.get(TranslateService);
    this._authZService = injector.get(AuthzService);
    this.scenarioChecks[ScenarioIds.addSiteFeaturesTab] = {
      id: ScenarioIds.addSiteFeaturesTab,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addSiteQuotas] = {
      id: ScenarioIds.addSiteQuotas,
      runCheck: (input: ScenarioCheckInput) => {
        return this._showSiteQuotas(input);
      },
    };

    this.scenarioChecks[ScenarioIds.addSiteFileStorage] = {
      id: ScenarioIds.addSiteFileStorage,
      runCheck: (input: ScenarioCheckInput) => {
        return this._showSiteFileStorage(input);
      },
    };

    this.scenarioChecks[ScenarioIds.getSiteSlotLimits] = {
      id: ScenarioIds.getSiteSlotLimits,
      runCheckAsync: (input: ScenarioCheckInput) => {
        return Observable.of(this._getSlotLimit(input));
      },
    };

    this.scenarioChecks[ScenarioIds.enablePlatform64] = {
      id: ScenarioIds.enablePlatform64,
      runCheck: (input: ScenarioCheckInput) => {
        const scenarioResult = this._enableIfBasicOrHigher(input);
        scenarioResult.data = this._translateService.instant(PortalResources.use32BitWorkerProcessUpsell);
        return scenarioResult;
      },
    };

    this.scenarioChecks[ScenarioIds.enableAlwaysOn] = {
      id: ScenarioIds.enableAlwaysOn,
      runCheck: (input: ScenarioCheckInput) => {
        const scenarioResult = this._enableIfBasicOrHigher(input);
        scenarioResult.data = this._translateService.instant(PortalResources.alwaysOnUpsell);
        return scenarioResult;
      },
    };

    this.scenarioChecks[ScenarioIds.webSocketsEnabled] = {
      id: ScenarioIds.webSocketsEnabled,
      runCheck: (input: ScenarioCheckInput) => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableSlots] = {
      id: ScenarioIds.enableSlots,
      runCheck: (input: ScenarioCheckInput) => {
        return this._enableIfStandardOrHigher(input);
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

    this.scenarioChecks[ScenarioIds.showSideNavMenu] = {
      id: ScenarioIds.showSideNavMenu,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.appInsightsConfigurable] = {
      id: ScenarioIds.appInsightsConfigurable,
      runCheckAsync: (input: ScenarioCheckInput) => this._getApplicationInsightsId(input),
    };

    this.scenarioChecks[ScenarioIds.vstsDeploymentPermission] = {
      id: ScenarioIds.vstsDeploymentHide,
      runCheckAsync: (input: ScenarioCheckInput) => this._vstsPermissionsCheck(input),
    };

    this.scenarioChecks[ScenarioIds.addScaleOut] = {
      id: ScenarioIds.addScaleOut,
      runCheck: (input: ScenarioCheckInput) => {
        return this._enableIfBasicOrHigher(input);
      },
    };

    this.scenarioChecks[ScenarioIds.canScaleForSlots] = {
      id: ScenarioIds.canScaleForSlots,
      runCheck: (input: ScenarioCheckInput) => {
        const enabled =
          input &&
          input.site &&
          (input.site.properties.sku === Tier.free ||
            input.site.properties.sku === Tier.shared ||
            input.site.properties.sku === Tier.basic ||
            input.site.properties.sku === Tier.standard);
        return { status: enabled ? 'enabled' : 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.alwaysOnSupported] = {
      id: ScenarioIds.alwaysOnSupported,
      runCheck: (input: ScenarioCheckInput) => {
        const sku = input && input.site && input.site.properties.sku;
        if (sku === Tier.elasticPremium || sku === Tier.elasticIsolated) {
          return <ScenarioResult>{
            status: 'disabled',
            data: this._translateService.instant(PortalResources.featureNotSupportedElastic),
          };
        }
        return <ScenarioResult>{ status: 'enabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return window.appsvc.env.runtimeType === 'Azure';
  }

  private _enableIfBasicOrHigher(input: ScenarioCheckInput) {
    const disabled = input && input.site && (input.site.properties.sku === Tier.free || input.site.properties.sku === Tier.shared);

    return <ScenarioResult>{
      status: disabled ? 'disabled' : 'enabled',
      data: null,
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

  private _showSiteQuotas(input: ScenarioCheckInput) {
    const site = input && input.site;

    if (!site) {
      throw Error('No site input specified');
    }

    const showQuotas = input.site.properties.sku === Tier.free || input.site.properties.sku === Tier.shared;

    return <ScenarioResult>{
      status: showQuotas ? 'enabled' : 'disabled',
      data: null,
    };
  }

  private _showSiteFileStorage(input: ScenarioCheckInput) {
    const site = input && input.site;

    if (!site) {
      throw Error('No site input specified');
    }

    const showFileStorage = input.site.properties.sku !== Tier.free && input.site.properties.sku !== Tier.shared;

    return <ScenarioResult>{
      status: showFileStorage ? 'enabled' : 'disabled',
      data: null,
    };
  }

  private _getSlotLimit(input: ScenarioCheckInput) {
    const site = input && input.site;
    if (!site) {
      throw Error('No site input specified');
    }

    let limit: number;

    switch (site.properties.sku) {
      case Tier.free:
      case Tier.basic:
        limit = 0;
        break;
      case Tier.dynamic:
        limit = 2;
        break;
      case Tier.standard:
        limit = 5;
        break;
      case Tier.premium:
      case Tier.premiumV2:
      case Tier.isolated:
      case Tier.premiumContainer:
      case Tier.elasticPremium:
      case Tier.elasticIsolated:
        limit = 20;
        break;
      default:
        limit = 0;
    }

    return <ScenarioResult>{
      status: 'enabled',
      data: limit,
    };
  }

  protected _getApplicationInsightsId(input: ScenarioCheckInput): Observable<ScenarioResult> {
    if (input.site) {
      return this._applicationInsightsService.getApplicationInsightResource(input.site.id).switchMap(resource => {
        return Observable.of<ScenarioResult>({
          status: 'enabled',
          data: resource,
        });
      });
    } else {
      return Observable.of<ScenarioResult>({
        status: 'disabled',
        data: null,
      });
    }
  }

  private _vstsPermissionsCheck(input: ScenarioCheckInput): Observable<ScenarioResult> {
    let requestedActions: string[] = [];
    let IsPublishProfileBasedDeploymentEnabled = Url.getFeatureValue(FeatureFlags.enablePublishProfileBasedDeployment);
    //Enabling FF
    IsPublishProfileBasedDeploymentEnabled = 'true';

    if (IsPublishProfileBasedDeploymentEnabled && input.site.kind.toLowerCase() === Kinds.app) {
      requestedActions = [AuthzService.websiteContributorScope];
    } else {
      requestedActions = [AuthzService.activeDirectoryWriteScope];
    }

    return this._authZService.hasPermission(input.site.id, requestedActions).map(value => {
      return <ScenarioResult>{
        status: value ? 'enabled' : 'disabled',
        data: {
          errorMessage: this._translateService.instant(PortalResources.vsts_permissions_error),
        },
      };
    });
  }
}
