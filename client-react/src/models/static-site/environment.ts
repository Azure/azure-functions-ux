export interface Environment {
  buildId: string;
  sourceBranch: string;
  createdTimeUtc: string;
  status: string;
  lastUpdatedOn?: string;
  hostname?: string;
  pullRequestTitle?: string;
}
