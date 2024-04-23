export type Runtime = {
  name: string;
  version: string;
};

export type AlwaysReadyPair = {
  name: string;
  instanceCount?: number;
};

export type ScaleAndConcurrency = {
  maximumInstanceCount?: number;
  instanceMemoryMB?: number;
  alwaysReady?: AlwaysReadyPair[];
};

export type DeploymentAuthentication = {
  type?: string;
  userAssignedIdentityResourceId?: string;
  storageAccountConnectionStringName?: string;
};

export type DeploymentStorage = {
  type?: string;
  value?: string;
  authentication?: DeploymentAuthentication;
};

export type FunctionAppDeployment = {
  storage?: DeploymentStorage;
};

export type FunctionAppConfig = {
  deployment?: FunctionAppDeployment;
  scaleAndConcurrency?: ScaleAndConcurrency;
  runtime?: Runtime;
};
