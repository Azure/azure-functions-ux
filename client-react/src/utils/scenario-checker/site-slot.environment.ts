import { ArmSiteDescriptor } from '../resourceDescriptors';

import { Environment, ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './scenario-ids';

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
