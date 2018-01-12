import { NationalCloudArmUris, ScenarioIds } from './../../models/constants';
import { AzureEnvironment } from './azure.environment';
import { ScenarioCheckInput } from './scenario.models';

export class NationalCloudEnvironment extends AzureEnvironment {
    name = 'NationalCloud';

    public static isNationalCloud() {
        return window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.mooncake.toLowerCase()
            || window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.fairfax.toLowerCase()
            || window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.blackforest.toLowerCase();
    }

    constructor() {
        super();
        this.scenarioChecks[ScenarioIds.addResourceExplorer] = {
            id: ScenarioIds.addResourceExplorer,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.addPushNotifications] = {
            id: ScenarioIds.addPushNotifications,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.addTinfoil] = {
            id: ScenarioIds.addTinfoil,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        return NationalCloudEnvironment.isNationalCloud();
    }
}
