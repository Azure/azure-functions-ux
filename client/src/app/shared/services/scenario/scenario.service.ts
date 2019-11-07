import { EmbeddedFunctionsEnvironment } from './embedded-functions.environment';
import { PortalService } from './../portal.service';
import { LogCategories } from './../../models/constants';
import { AzureTryEnvironment } from './azure-try.environment';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from './../log.service';
import { NationalCloudEnvironment } from './national-cloud.environment';
import { DynamicSiteEnvironment } from './dynamic-site.environment';
import { SiteSlotEnvironment } from './site-slot.environment';
import { Observable } from 'rxjs/Observable';
import { AzureEnvironment } from './azure.environment';
import { ScenarioCheckResult, ScenarioResult } from './scenario.models';
import { ScenarioCheckInput } from './scenario.models';
import { StandaloneEnvironment } from './stand-alone.environment';
import { OnPremEnvironment } from './onprem.environment';
import { Environment } from './scenario.models';
import { Injectable, Injector } from '@angular/core';
import { LinuxSiteEnvironment } from 'app/shared/services/scenario/linux-site.environment';
import { XenonSiteEnvironment } from 'app/shared/services/scenario/xenon-site.environment';
import { DynamicLinuxEnvironment } from './dynamic-linux.environment';
import { FunctionAppEnvironment } from './function-app.environment';
import { WindowsCodeEnvironment } from './windows-code.environment';
import { ContainerEnvironment } from './container.environment';
import { AppOnAse } from './app-on-ase.environment';

export interface IScenarioService {
  checkScenario(id: string, input?: ScenarioCheckInput): ScenarioCheckResult;
  checkScenarioAsync(id: string, input?: ScenarioCheckInput): Observable<ScenarioCheckResult>;
}

@Injectable()
export class ScenarioService implements IScenarioService {
  private _environments: Environment[] = [
    new StandaloneEnvironment(),
    new OnPremEnvironment(this._injector),
    new SiteSlotEnvironment(this._translateService),
    new DynamicSiteEnvironment(this._translateService),
    new LinuxSiteEnvironment(this._translateService),
    new XenonSiteEnvironment(this._injector),
    new AzureTryEnvironment(),
    new EmbeddedFunctionsEnvironment(this._portalService),
    new DynamicLinuxEnvironment(this._translateService),
    new FunctionAppEnvironment(this._injector),
    new WindowsCodeEnvironment(this._injector),
    new ContainerEnvironment(),
    new AppOnAse(this._injector),
  ];

  constructor(
    private _logService: LogService,
    private _translateService: TranslateService,
    private _portalService: PortalService,
    private _injector: Injector
  ) {
    // National cloud environments inherit from AzureEnvironment so we ensure there
    // aren't duplicates to reduce the chance of conflicts in behavior.
    if (NationalCloudEnvironment.isNationalCloud()) {
      this._environments.splice(0, 0, new NationalCloudEnvironment(_injector));
    } else {
      this._environments.splice(0, 0, new AzureEnvironment(_injector));
    }
  }

  // Does a synchronous check against all possible environments to see whether a
  // scenario should be either enabled (whitelisted) or disabled (blacklisted).  Things to note:
  // 1. Blacklisting takes priority, so if there are several environments which say that a scenario is
  //    enabled, but there is one environment that says a scenario is disabled, then the disable will
  //    take precedence.
  // 2. If any matching environment has only implemented an async check, it will throw an error since
  //    this is a synchronous function.
  public checkScenario(id: string, input?: ScenarioCheckInput): ScenarioCheckResult {
    const results = this._environments
      .filter(env => env.isCurrentEnvironment(input) && env.scenarioChecks[id]) // TODO: [ehamai] add in env.scenarioChecks[id] here
      .map(env => {
        const check = env.scenarioChecks[id];
        if (check.runCheckAsync) {
          throw Error(
            `An async check was defined for Environment: "${env.name}", Scenario: "${check.id}".  You must run checkScenarioAsync instead.`
          );
        }

        if (check.runCheck) {
          const result = check.runCheck(input);
          return <ScenarioCheckResult>{
            status: result && result.status,
            data: result && result.data,
            environmentName: env.name,
            id: id,
          };
        } else {
          throw Error('No runCheck method implemented for Environment: "${env.name}", Scenario: "${check.id}"');
        }
      });

    return this._getFinalResult(id, results);
  }

  // Similar to checkScenario, checkScenarioAsync will do checks for scenario's that require
  // async behaviors.  If a matching scenario implemented "runCheckAsync", then it will used in this check.
  // If however it has only implemented a the synchronous "runCheck" method, then it will treat
  // it as an asynchronous function and include its result in the final status calculation.
  public checkScenarioAsync(id: string, input?: ScenarioCheckInput): Observable<ScenarioCheckResult> {
    const checks = this._environments
      .filter(env => env.isCurrentEnvironment(input) && env.scenarioChecks[id])
      .map(env => {
        const check = env.scenarioChecks[id];
        let runCheckObs: Observable<ScenarioResult>;

        if (check.runCheckAsync) {
          runCheckObs = check.runCheckAsync(input);
        } else if (check.runCheck) {
          runCheckObs = Observable.of(check.runCheck(input));
        } else {
          throw Error('No runCheckAsync or runCheck method implemented for Environment: "${env.name}", Scenario: "${check.id}"');
        }

        return runCheckObs.map(r => {
          return <ScenarioCheckResult>{
            status: r.status,
            data: r.data,
            environmentName: env.name,
            id: id,
          };
        });
      });

    if (checks.length === 0) {
      return Observable.of(<ScenarioCheckResult>{
        id: id,
        status: null,
        environmentName: null,
      });
    }

    return Observable.zip.apply(this, checks).map(results => {
      return this._getFinalResult(id, results);
    });
  }

  private _getFinalResult(id: string, results: ScenarioCheckResult[]) {
    let enabledResult: ScenarioCheckResult;
    let result: ScenarioCheckResult;

    const disabledResult = results.find(r => {
      if (r && r.status === 'disabled') {
        return true;
      } else if (r && r.status === 'enabled' && !enabledResult) {
        enabledResult = r;
      }

      return false;
    });

    // A single disabled check takes precedence to disable the entire scenario
    if (disabledResult) {
      result = disabledResult;
    } else if (enabledResult) {
      result = enabledResult;
    } else {
      result = <ScenarioCheckResult>{
        id: id,
        status: null,
        environmentName: null,
      };
    }

    this._logService.debug(
      LogCategories.scenarioService,
      `Final result: id = ${result.id}, environment = ${result.environmentName}, status = ${result.status}`
    );

    return result;
  }
}
