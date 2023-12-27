export enum AppType {
  WebApp = 'webapp',
  FunctionApp = 'functionapp',
}

export enum PublishType {
  Code = 'code',
  Container = 'container',
}

export enum Os {
  Linux = 'linux',
  Windows = 'windows',
}

export enum RuntimeStacks {
  Java = 'java',
  Node = 'node',
  Python = 'python',
  Powershell = 'powershell',
  Dotnet = 'dotnet',
  DotnetIsolated = 'dotnet-isolated',
  Php = 'php',
  WordPress = 'wordpress'
}

export enum JavaContainers {
  JavaSE = 'java',
  Tomcat = 'tomcat',
  JBoss = 'jbosseap',
}

export enum AuthType {
  Oidc = 'oidc',
  PublishProfile = 'publishprofile',
}
