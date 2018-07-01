import { ScenarioCheckInput } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from './scenario.models';
import { ArmUtil } from '../../Utilities/arm-utils';

export class DynamicLinuxEnvironment extends Environment {
    name = 'DynamicLinux';

    constructor() {
        super();
        this.scenarioChecks[ScenarioIds.listExtensionsArm] = {
            id: ScenarioIds.listExtensionsArm,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };
    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        if (input && input.site) {
            return ArmUtil.isLinuxDynamic(input.site);
        }

        return false;
    }
}
