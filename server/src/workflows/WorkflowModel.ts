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

export enum JavaContainers {
  JavaSE = 'java',
  Tomcat = 'tomcat',
  JBoss = 'jbosseap',
}
