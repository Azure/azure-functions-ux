import { ScenarioCheckInput } from './scenario.models';
import { Environment } from './scenario.models';
import { ScenarioIds } from 'app/shared/models/constants';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';

export class KubeAppEnvironment extends Environment {
  name = 'KubeApp';

  constructor() {
    super();

    this.scenarioChecks[ScenarioIds.onedriveSource] = {
      id: ScenarioIds.onedriveSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.dropboxSource] = {
      id: ScenarioIds.dropboxSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.externalSource] = {
      id: ScenarioIds.externalSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.bitbucketSource] = {
      id: ScenarioIds.bitbucketSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.vstsSource] = {
      id: ScenarioIds.vstsSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.vstsKuduSource] = {
      id: ScenarioIds.vstsKuduSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.ftpSource] = {
      id: ScenarioIds.ftpSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.localGitSource] = {
      id: ScenarioIds.localGitSource,
      runCheck: () => ({ status: 'disabled' }),
    };

    this.scenarioChecks[ScenarioIds.showAllMinTlsVersions] = {
      id: ScenarioIds.showAllMinTlsVersions,
      runCheck: () => ({ status: 'disabled' }),
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return ArmUtil.isKubeApp(input.site);
    }

    return false;
  }
}
