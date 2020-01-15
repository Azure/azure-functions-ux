import { EmbeddedFunctionsEnvironment } from './embedded-functions.environment';
import { NationalCloudEnvironment } from './national-cloud.environment';
import { DynamicSiteEnvironment } from './dynamic-site.environment';
import { AzureEnvironment } from './azure.environment';
import { ScenarioCheckResult, ScenarioResult, ScenarioCheckInput, Environment } from './scenario.models';
import { LinuxSiteEnvironment } from './linux-site.environment';
import { XenonSiteEnvironment } from './xenon-site.environment';
import { DynamicLinuxEnvironment } from './dynamic-linux.environment';
import { FunctionAppEnvironment } from './function-app.environment';
import { WindowsCode } from './windows-code.environment';
import { ContainerApp } from './container.environment';
import { ElasticPremiumAppEnvironment } from './elastic-premium.environment';

export interface IScenarioService {
  checkScenario(id: string, input?: ScenarioCheckInput): ScenarioCheckResult;
  checkScenarioAsync(id: string, input?: ScenarioCheckInput): Promise<ScenarioCheckResult>;
  _getFinalResult(id: string, results: ScenarioCheckResult[]);
}

export class ScenarioService {
  private _environments: Environment[];

  constructor(t: (string) => string) {
    this._environments = [
      new DynamicSiteEnvironment(t),
      new LinuxSiteEnvironment(t),
      new XenonSiteEnvironment(t),
      new EmbeddedFunctionsEnvironment(t),
      new DynamicLinuxEnvironment(t),
      new FunctionAppEnvironment(t),
      new WindowsCode(t),
      new ContainerApp(t),
      new ElasticPremiumAppEnvironment(t),
    ];
    // National cloud environments inherit from AzureEnvironment so we ensure there
    // aren't duplicates to reduce the chance of conflicts in behavior.
    if (NationalCloudEnvironment.isNationalCloud()) {
      this._environments.splice(0, 0, new NationalCloudEnvironment(t));
    } else {
      this._environments.splice(0, 0, new AzureEnvironment(t));
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
          return {
            id,
            status: result.status,
            data: result.data,
            environmentName: env.name,
          };
        }

        throw Error(`No runCheck method implemented for Environment: "${env.name}", Scenario: "${check.id}"`);
      });

    return this.getFinalResult(id, results);
  }

  // Similar to checkScenario, checkScenarioAsync will do checks for scenario's that require
  // async behaviors.  If a matching scenario implemented "runCheckAsync", then it will used in this check.
  // If however it has only implemented a the synchronous "runCheck" method, then it will treat
  // it as an asynchronous function and include its result in the final status calculation.
  public async checkScenarioAsync(id: string, input?: ScenarioCheckInput): Promise<ScenarioCheckResult> {
    const checks = this._environments
      .filter(env => env.isCurrentEnvironment(input) && env.scenarioChecks[id])
      .map(async env => {
        const check = env.scenarioChecks[id];
        let runCheckObs: ScenarioResult;

        if (check.runCheckAsync) {
          runCheckObs = await check.runCheckAsync(input);
        } else if (check.runCheck) {
          runCheckObs = check.runCheck(input);
        } else {
          throw Error(`No runCheckAsync or runCheck method implemented for Environment: "${env.name}", Scenario: "${check.id}"`);
        }

        return { ...runCheckObs, id, environmentName: env.name };
      });

    if (checks.length === 0) {
      return Promise.resolve({
        id,
        status: null,
      });
    }

    const results = await Promise.all(checks);
    return this.getFinalResult(id, results);
  }

  private getFinalResult(id: string, results: ScenarioCheckResult[]) {
    let enabledResult: ScenarioCheckResult | undefined;
    let result: ScenarioCheckResult;

    const disabledResult = results.find(r => {
      if (r && r.status === 'disabled') {
        return true;
      }

      if (r && r.status === 'enabled' && !enabledResult) {
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
      result = {
        id,
        status: null,
      };
    }

    return result;
  }
}
