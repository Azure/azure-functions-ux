export enum Versions {
  version20200601 = '2020-06-01',
  version20200501 = '2020-05-01',
}

// NOTE (allisonm): I did not add 20200601 here for two reasons
// 1) We aren't going to back-support specific WebApp Calls
// 2) I didn't rename or reversion anything because of upcoming work
// to change to a Version based on this work item suggested by Elliott:
// Task 7363507: [Stacks] Controller should create a stack instance based on API version
export const WebAppVersions = [Versions.version20200501];

export const FunctionAppVersions = [Versions.version20200501, Versions.version20200601];
