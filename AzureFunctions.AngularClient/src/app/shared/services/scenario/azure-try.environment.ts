import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from 'app/shared/services/scenario/scenario.models';
import { Url } from 'app/shared/Utilities/url';

export class AzureTryEnvironment extends Environment {
    name = 'Azure';

    constructor() {
        super();

        this.scenarioChecks[ScenarioIds.filterAppNodeChildren] = {
            id: ScenarioIds.filterAppNodeChildren,
            runCheck: (input: ScenarioCheckInput) => {
                return this._filterAppNodeChildren(input);
            }
        };
    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        return Url.getParameterByName(null, 'trial') === 'true';
    }

    private _filterAppNodeChildren(input: ScenarioCheckInput) {
        const data = input.appNodeChildren.find(c => c.dashboardType === DashboardType.FunctionsDashboard);
        return <ScenarioResult>{
            status: 'enabled',
            data: [data]
        };
    }
}
