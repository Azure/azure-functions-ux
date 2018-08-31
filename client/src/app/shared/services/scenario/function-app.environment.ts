import { ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from '../../models/constants';
import { Environment } from './scenario.models';

export class FunctionAppEnvironment extends Environment {
    name = 'DynamicSite';

    constructor() {
        super();
        this.scenarioChecks[ScenarioIds.vstsDeployment] = {
            id: ScenarioIds.showSiteAvailability,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };
    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        if (input && input.site) {
            return input.site.kind.toLowerCase().includes('functionapp');
        }

        return false;
    }
}
