import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from 'app/shared/services/scenario/scenario.models';
import { Observable } from 'rxjs/Observable';

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

        this.scenarioChecks[ScenarioIds.appInsightsConfigurable] = {
            id: ScenarioIds.appInsightsConfigurable,
            runCheckAsync: (input: ScenarioCheckInput) => {
                return Observable.of<ScenarioResult>({
                    status: 'disabled',
                    data: null
                });
            }
        };

    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        return window.appsvc.env.runtimeType === 'OnPrem';
    }
}
