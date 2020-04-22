import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from 'app/shared/services/scenario/scenario.models';
import { QuotaService } from '../quota.service';
import { ArmResourceDescriptor } from 'app/shared/resourceDescriptors';
import { QuotaNames, QuotaScope } from 'app/shared/models/arm/quotaSettings';
import { ComputeMode } from 'app/shared/models/arm/site';
import { Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from './../../../shared/models/portal-resources';

export class OnPremEnvironment extends Environment {
  name = 'OnPrem';
  private _quotaService: QuotaService;
  private _translateService: TranslateService;
  private _upSellMessage: string;

  constructor(injector: Injector) {
    super();
    this._quotaService = injector.get(QuotaService);
    this._translateService = injector.get(TranslateService);
    this._upSellMessage = this._translateService.instant(PortalResources.upgradeUpsell);
    this.scenarioChecks[ScenarioIds.addSiteFeaturesTab] = {
      id: ScenarioIds.addSiteFeaturesTab,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.openOldWebhostingPlanBlade] = {
      id: ScenarioIds.openOldWebhostingPlanBlade,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.appInsightsConfigurable] = {
      id: ScenarioIds.appInsightsConfigurable,
      runCheckAsync: (input: ScenarioCheckInput) => {
        return Observable.of<ScenarioResult>({
          status: 'disabled',
          data: null,
        });
      },
    };

    this.scenarioChecks[ScenarioIds.addPushNotifications] = {
      id: ScenarioIds.addPushNotifications,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.addDiagnoseAndSolve] = {
      id: ScenarioIds.addDiagnoseAndSolve,
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

    this.scenarioChecks[ScenarioIds.remoteDebuggingSupported] = {
      id: ScenarioIds.remoteDebuggingSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.useOldScaleUpBlade] = {
      id: ScenarioIds.useOldScaleUpBlade,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.useOldActivityLogBlade] = {
      id: ScenarioIds.useOldActivityLogBlade,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.pricingTierApiEnabled] = {
      id: ScenarioIds.pricingTierApiEnabled,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.functionBeta] = {
      id: ScenarioIds.functionBeta,
      runCheck: () => {
        return { status: 'disabled' };
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

    this.scenarioChecks[ScenarioIds.addLogicApps] = {
      id: ScenarioIds.addLogicApps,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableAlwaysOn] = {
      id: ScenarioIds.enableAlwaysOn,
      runCheckAsync: (input: ScenarioCheckInput) => {
        if (!input || !input.site || !input.site.id) {
          return Observable.of<ScenarioResult>({
            status: 'disabled',
            data: this._upSellMessage,
          });
        }
        const armResourceDescriptor = new ArmResourceDescriptor(input.site.id);
        return this._quotaService
          .getQuotaLimit(
            armResourceDescriptor.subscription,
            QuotaNames.alwaysOnEnabled,
            input.site.properties.sku,
            input.site.properties.computeMode,
            QuotaScope.Site
          )
          .map(limit => {
            return <ScenarioResult>{
              // limit is infinity when it is -1
              status: limit !== 0 ? 'enabled' : 'disabled',
              data: this._upSellMessage,
            };
          });
      },
    };

    this.scenarioChecks[ScenarioIds.enableAutoSwap] = {
      id: ScenarioIds.enableAutoSwap,
      runCheckAsync: (input: ScenarioCheckInput) => {
        if (!input || !input.site || !input.site.id) {
          return Observable.of<ScenarioResult>({
            status: 'disabled',
            data: this._upSellMessage,
          });
        }
        const armResourceDescriptor = new ArmResourceDescriptor(input.site.id);
        return this._quotaService
          .getQuotaLimit(
            armResourceDescriptor.subscription,
            QuotaNames.numberOfSlotsPerSite,
            input.site.properties.sku,
            input.site.properties.computeMode
          )
          .map(limit => {
            return <ScenarioResult>{
              status: limit > 1 || limit === -1 ? 'enabled' : 'disabled',
              data: this._upSellMessage,
            };
          });
      },
    };

    this.scenarioChecks[ScenarioIds.getSiteSlotLimits] = {
      id: ScenarioIds.getSiteSlotLimits,
      runCheckAsync: (input: ScenarioCheckInput) => {
        return this._getSlotLimit(input);
      },
    };

    this.scenarioChecks[ScenarioIds.enablePlatform64] = {
      id: ScenarioIds.enablePlatform64,
      runCheckAsync: (input: ScenarioCheckInput) => {
        if (!input || !input.site || !input.site.id) {
          return Observable.of<ScenarioResult>({
            status: 'disabled',
            data: this._upSellMessage,
          });
        }
        const armResourceDescriptor = new ArmResourceDescriptor(input.site.id);
        return this._quotaService
          .getQuotaLimit(
            armResourceDescriptor.subscription,
            QuotaNames.workerProcess64BitEnabled,
            input.site.properties.sku,
            input.site.properties.computeMode
          )
          .map(limit => {
            return <ScenarioResult>{
              status: limit !== 0 ? 'enabled' : 'disabled',
              data: this._upSellMessage,
            };
          });
      },
    };

    this.scenarioChecks[ScenarioIds.webSocketsEnabled] = {
      id: ScenarioIds.webSocketsEnabled,
      runCheckAsync: (input: ScenarioCheckInput) => {
        if (!input || !input.site || !input.site.id) {
          return Observable.of<ScenarioResult>({
            status: 'disabled',
            data: this._upSellMessage,
          });
        }
        const armResourceDescriptor = new ArmResourceDescriptor(input.site.id);
        return this._quotaService
          .getQuotaLimit(
            armResourceDescriptor.subscription,
            QuotaNames.webSocketsEnabled,
            input.site.properties.sku,
            input.site.properties.computeMode
          )
          .map(limit => {
            return <ScenarioResult>{
              status: limit !== 0 ? 'enabled' : 'disabled',
              data: this._upSellMessage,
            };
          });
      },
    };

    this.scenarioChecks[ScenarioIds.enableLinkAPIM] = {
      id: ScenarioIds.enableLinkAPIM,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.appDensity] = {
      id: ScenarioIds.appDensity,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.containerSettings] = {
      id: ScenarioIds.containerSettings,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  private _showSiteQuotas(input: ScenarioCheckInput) {
    const site = input && input.site;

    if (!site) {
      throw Error('No site input specified');
    }

    const showQuotas = input.site.properties.computeMode === ComputeMode.Shared;

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

    const showFileStorage = input.site.properties.computeMode !== ComputeMode.Shared;

    return <ScenarioResult>{
      status: showFileStorage ? 'enabled' : 'disabled',
      data: null,
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return window.appsvc.env.runtimeType === 'OnPrem';
  }

  private _getSlotLimit(input: ScenarioCheckInput) {
    if (!input || !input.site || !input.site.id) {
      throw Error('No site input specified');
    }

    const armResourceDescriptor = new ArmResourceDescriptor(input.site.id);
    return this._quotaService
      .getQuotaLimit(
        armResourceDescriptor.subscription,
        QuotaNames.numberOfSlotsPerSite,
        input.site.properties.sku,
        input.site.properties.computeMode
      )
      .map(limit => {
        return <ScenarioResult>{
          status: 'enabled',
          data: limit,
        };
      });
  }
}
