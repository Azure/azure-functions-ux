import { SiteDescriptor } from 'app/shared/resourceDescriptors';
import { ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from 'app/shared/services/scenario/scenario.models';

export class SiteSlotEnvironment extends Environment {
    name = 'SiteSlot';

    constructor() {
        super();
        this.scenarioChecks[ScenarioIds.showSiteAvailability] = {
            id: ScenarioIds.showSiteAvailability,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };
    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        if (input && input.site) {
            const descriptor = SiteDescriptor.getSiteDescriptor(input.site.id);
            return !!descriptor.slot;
        }

        return false;
    }
}
