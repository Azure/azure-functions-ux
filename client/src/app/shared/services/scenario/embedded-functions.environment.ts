import { PortalService } from './../portal.service';
import { ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from 'app/shared/services/scenario/scenario.models';

export class EmbeddedFunctionsEnvironment extends Environment {
    name = 'Embedded';

    constructor(private _portalService: PortalService) {
        super();
        this.scenarioChecks[ScenarioIds.showSideNavMenu] = {
            id: ScenarioIds.showSideNavMenu,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.addTopLevelAppsNode] = {
            id: ScenarioIds.addTopLevelAppsNode,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };
    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        return this._portalService.isEmbeddedFunctions;
    }

}
