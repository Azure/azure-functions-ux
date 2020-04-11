import { ArmObj } from '../arm-obj';

export interface Environment {
  buildId: string;
  sourceBranch: string;
  createdTimeUtc: string;
  status: string;
  lastUpdatedOn?: string;
  hostname?: string;
  pullRequestTitle?: string;
}

export interface Environments {
  value: ArmObj<Environment>[];
  id?: string;
  nextLink?: string;
}
