export enum AppType {
  WebApp = 'WebApp',
  FunctionApp = 'FunctionApp',
}

export enum PublishType {
  Code = 'code',
  Container = 'container',
}

export enum Os {
  Linux = 'linux',
  Windows = 'windows',
}

export enum WebAppRuntimeStack {
  DotNetCore = 'dotnetcore',
  Java = 'java',
  Node = 'node',
  AspNet = 'aspnet',
  Python = 'python',
}

export enum FunctionAppRuntimeStack {
  DotNetCore = 'dotnetcore',
  Java = 'java',
  Node = 'node',
  Python = 'python',
  Powershell = 'powershell',
}

export enum JavaWorkflowType {
  War = 'war',
  Jar = 'jar',
}

export interface CodeVariables {
  siteName?: string;
  slotName?: string;
  runtimeVersion?: string;
  publishingProfileSecretName?: string;
}

export interface ContainerVariables {
  siteName?: string;
  slotName?: string;
  loginServer?: string;
  publishServer?: string;
  image?: string;
  dockerUserSecretName?: string;
  dockerPasswordSecretName?: string;
  publishingProfileSecretName?: string;
}
