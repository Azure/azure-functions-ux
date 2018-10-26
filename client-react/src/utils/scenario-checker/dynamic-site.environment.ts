import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
import i18n from '../../utils/i18n';

export class DynamicSiteEnvironment extends Environment {
  public name = 'DynamicSite';

  constructor() {
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
          data: i18n.t('featureNotSupportedConsumption'),
        };
      },
    };

    this.scenarioChecks[ScenarioIds.addScaleUp] = {
      id: ScenarioIds.addScaleUp,
      runCheck: () => {
        return {
          status: 'disabled',
          data: i18n.t('featureNotSupportedConsumption'),
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
    if (input && input.site && input.site.properties && input.site.properties.sku) {
      return input.site.properties.sku.toLowerCase() === 'dynamic';
    }

    return false;
  }
}
