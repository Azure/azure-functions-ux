import { ArmObj } from '../../models/arm-obj';
import { ServerFarm } from '../../models/serverFarm/serverfarm';
import { Site } from '../../models/site/site';

export interface ScenarioCheckInput {
  site?: ArmObj<Site>;
  serverFarm?: ArmObj<ServerFarm>;
}

export type ScenarioStatus = 'enabled' | 'disabled' | null;

export interface ScenarioResult {
  status: ScenarioStatus;
  data?: any;
}

export interface ScenarioCheckResult extends ScenarioResult {
  id?: string;
  environmentName?: string;
}

interface ScenarioCheck {
  id: string;
  runCheck?: (input?: ScenarioCheckInput) => ScenarioResult;
  runCheckAsync?: (input?: ScenarioCheckInput) => Promise<ScenarioResult>;
}

export abstract class Environment {
  public scenarioChecks: { [key: string]: ScenarioCheck } = {};

  public abstract name: string;
  public abstract isCurrentEnvironment(input?: ScenarioCheckInput): boolean;
}
