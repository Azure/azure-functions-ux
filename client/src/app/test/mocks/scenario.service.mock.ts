import { Injectable } from '@angular/core';
import { IScenarioService } from '../../shared/services/scenario/scenario.service';
import { ScenarioCheckInput, ScenarioCheckResult } from '../../shared/services/scenario/scenario.models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class MockScenarioService implements IScenarioService {
  checkScenario(id: string, input?: ScenarioCheckInput): ScenarioCheckResult {
    return {
      id: id,
      environmentName: '',
      status: 'enabled',
      data: null,
    };
  }

  checkScenarioAsync(id: string, input?: ScenarioCheckInput): Observable<ScenarioCheckResult> {
    return Observable.of(this.checkScenario(id, input));
  }
}
