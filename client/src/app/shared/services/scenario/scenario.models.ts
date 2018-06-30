import { TreeNode } from './../../../tree-view/tree-node';
import { Observable } from 'rxjs/Observable';
import { Site } from './../../models/arm/site';
import { ArmObj } from './../../models/arm/arm-obj';

export interface ScenarioCheckInput {
    site?: ArmObj<Site>;
    appNodeChildren?: TreeNode[];
}

export type ScenarioStatus = 'enabled' | 'disabled' | null;

export interface ScenarioResult {
    status: ScenarioStatus;
    data?: any;
}

export interface ScenarioCheckResult extends ScenarioResult {
    id: string;
    environmentName: string;
}

interface ScenarioCheck {
    id: string;
    runCheck?: (input?: ScenarioCheckInput) => ScenarioResult;
    runCheckAsync?: (input?: ScenarioCheckInput) => Observable<ScenarioResult>;
}

export abstract class Environment {
    scenarioChecks: { [key: string]: ScenarioCheck } = {};

    abstract name: string;
    abstract isCurrentEnvironment(input?: ScenarioCheckInput): boolean;

}
