export interface MinorVersion {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
}

export interface MajorVersion extends MinorVersion {
  minorVersions: MinorVersion[];
}

export interface Framework {
  name: string;
  display: string;
  majorVersions: MajorVersion[];
}

export interface AvailableStack extends Framework {
  frameworks: Framework[];
}

export enum OsType {
  Linux = 'Linux',
  Windows = 'Windows',
}

export class AvailableStackNames {
  public static readonly NetStack = 'aspnet';
  public static readonly DotNetCore = 'dotnetcore';
  public static readonly NodeStack = 'node';
  public static readonly PhpStack = 'php';
  public static readonly CustomContainer = 'custom';
  public static readonly PythonStack = 'python';
  public static readonly JavaStack = 'java';
  public static readonly RubyStack = 'ruby';
  public static readonly JavaContainer = 'javaContainers';
  // not an actual stackname returned by AvailableStacks api
  public static readonly JavaStackForFunctions = 'javaForFunctions';
}

export class LinuxConstants {
  public static readonly dockerPrefix = 'DOCKER|';
  public static readonly composePrefix = 'COMPOSE|';
  public static readonly kubernetesPrefix = 'KUBE|';
}
