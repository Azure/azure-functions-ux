import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
export class DynamicSiteEnvironment extends Environment {
  public name = 'DynamicSite';

  constructor(t: (string) => string) {
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
          data: t('featureNotSupportedConsumption'),
        };
      },
    };

    this.scenarioChecks[ScenarioIds.addScaleUp] = {
      id: ScenarioIds.addScaleUp,
      runCheck: () => {
        return {
          status: 'disabled',
          data: t('featureNotSupportedConsumption'),
        };
      },
    };

    this.scenarioChecks[ScenarioIds.canScaleForSlots] = {
      id: ScenarioIds.canScaleForSlots,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.clientAffinitySupported] = {
      id: ScenarioIds.clientAffinitySupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.alwaysOnSupported] = {
      id: ScenarioIds.alwaysOnSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.dailyUsageQuotaSupported] = {
      id: ScenarioIds.dailyUsageQuotaSupported,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site && input.site.properties && input.site.properties.sku) {
      return input.site.properties.sku.toLowerCase() === 'dynamic';
    }

    return false;
  }
}
