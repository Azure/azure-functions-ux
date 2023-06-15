import { Environment, ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './scenario-ids';
export class ElasticPremiumAppEnvironment extends Environment {
  public name = 'ElasticPremiumApp';

  constructor() {
    super();
    this.scenarioChecks[ScenarioIds.alwaysOnSupported] = {
      id: ScenarioIds.alwaysOnSupported,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.runtimeScaleMonitoringSupported] = {
      id: ScenarioIds.runtimeScaleMonitoringSupported,
      runCheck: () => {
        return { status: 'enabled' };
      },
    };

    this.scenarioChecks[ScenarioIds.enableMinCipherSuite] = {
      id: ScenarioIds.enableMinCipherSuite,
      runCheck: () => ({
        status: 'enabled',
      }),
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site && input.site.properties && input.site.properties.sku) {
      const { sku } = input.site.properties;
      return sku.toLowerCase() === 'elasticpremium' || sku.toLowerCase() === 'elasticisolated';
    }

    return false;
  }
}
