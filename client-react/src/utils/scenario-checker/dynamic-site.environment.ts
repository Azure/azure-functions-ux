import i18n from '../../utils/i18n';
import { ScenarioCheckInput, Environment } from './scenario.models';
import { ScenarioIds } from './scenario-ids';

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
    if (input && input.site) {
      return input.site.properties.sku.toLowerCase() === 'dynamic';
    }

    return false;
  }
}
