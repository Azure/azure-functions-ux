import { ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from 'app/shared/services/scenario/scenario.models';

export class StandaloneEnvironment extends Environment {
    name: 'Standalone';

    constructor() {
        super();
        this.scenarioChecks[ScenarioIds.addSiteConfigTab] = {
            id: ScenarioIds.addSiteConfigTab,
            runCheck: () => {
                return { status: 'enabled' };
            }
        };
    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        return window.appsvc.env.runtimeType === 'Standalone';
    }
}
