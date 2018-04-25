import { ScenarioCheckInput } from './scenario.models';
import { ScenarioIds, ScenarioStatus } from './../../models/constants';
import { Environment } from 'app/shared/services/scenario/scenario.models';

export class OnPremEnvironment extends Environment {
    name = 'OnPrem';

    constructor() {
        super();
        this.scenarioChecks[ScenarioIds.addSiteFeaturesTab] = {
            id: ScenarioIds.addSiteFeaturesTab,
            runCheck: () => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.openOldWebhostingPlanBlade] = {
            id: ScenarioIds.openOldWebhostingPlanBlade,
            runCheck: () => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.appInsightsConfiguration] = {
            id: ScenarioIds.appInsightsConfiguration,
            runCheck: () => {
                return { status: ScenarioStatus.disabled };
            }
        };


        this.scenarioChecks[ScenarioIds.enableAppInsights] = {
            id: ScenarioIds.enableAppInsights,
            runCheck: () => {
                return {
                    status: 'disabled',
                    data: null
                };
            }
        };

    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        return window.appsvc.env.runtimeType === 'OnPrem';
    }
}
