import { ScenarioIds } from './scenario-ids';
import { ScenarioCheckInput, Environment } from './scenario.models';
import { ArmSiteDescriptor } from '../resourceDescriptors';

export class SiteSlotEnvironment extends Environment {
  public name = 'SiteSlot';

  constructor() {
    super();
    this.scenarioChecks[ScenarioIds.showSiteAvailability] = {
      id: ScenarioIds.showSiteAvailability,
      runCheck: () => {
        return { status: 'disabled' };
      },
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      const descriptor = new ArmSiteDescriptor(input.site.id);
      return !!descriptor.slot;
    }

    return false;
  }
}
