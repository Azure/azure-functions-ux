import { ScenarioCheckInput } from './scenario.models';
import { Environment } from './scenario.models';
import { Kinds } from 'app/shared/models/constants';

export class FunctionAppEnvironment extends Environment {
  name = 'DynamicSite';

  constructor() {
    super();
  }

  public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
    if (input && input.site) {
      return input.site.kind.toLowerCase().includes(Kinds.functionApp);
    }

    return false;
  }
}
