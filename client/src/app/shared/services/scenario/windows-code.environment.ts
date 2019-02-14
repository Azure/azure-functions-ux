import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { ScenarioIds, Kinds } from '../../models/constants';
import { Environment } from './scenario.models';

export class WindowsCodeEnvironment extends Environment {
  name = 'WindowsCode';

  constructor() {
    super();

    const disabledResult: ScenarioResult = {
      status: 'disabled',
      data: null,
    };

    this.scenarioChecks[ScenarioIds.byosSupported] = {
      id: ScenarioIds.byosSupported,
      runCheck: () => disabledResult,
    };
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    return (
      !!input &&
      !!input.site &&
      (input.site.kind!.toLowerCase() === Kinds.app.toLowerCase() || input.site.kind!.toLowerCase() === Kinds.api.toLowerCase())
    );
  }
}
