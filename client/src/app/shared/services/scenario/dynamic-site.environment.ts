import { PortalResources } from './../../models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from './scenario.models';

export class DynamicSiteEnvironment extends Environment {
  name = 'DynamicSite';

  constructor(translateService: TranslateService) {
    super();
    this.scenarioChecks[ScenarioIds.showSiteAvailability] = {
      id: ScenarioIds.showSiteAvailability,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableBackups] = {
      id: ScenarioIds.enableBackups,
      runCheck: () => {
        return {
          status: 'disabled',
          data: translateService.instant(PortalResources.featureNotSupportedConsumption),
        };
      },
    };

    this.scenarioChecks[ScenarioIds.addScaleUp] = {
      id: ScenarioIds.addScaleUp,
      runCheck: () => {
        return {
          status: 'disabled',
          data: translateService.instant(PortalResources.featureNotSupportedConsumption),
        };
      },
    };

    this.scenarioChecks[ScenarioIds.addScaleOut] = {
      id: ScenarioIds.addScaleOut,
      runCheck: () => {
        return {
          status: 'disabled',
          data: translateService.instant(PortalResources.featureNotSupportedConsumption),
        };
      },
    };

    this.scenarioChecks[ScenarioIds.canScaleForSlots] = {
      id: ScenarioIds.canScaleForSlots,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site && input.site.properties.sku) {
      return input.site.properties.sku.toLowerCase() === 'dynamic';
    }

    return false;
  }
}
