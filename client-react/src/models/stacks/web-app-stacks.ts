// NOTE (krmitta): Should match with the schema coming from the backend: stacks/webapp/2020-06-01/stack.model.ts

export interface WebAppRuntimes {
  linuxRuntimeSettings?: WebAppRuntimeSettings;
  windowsRuntimeSettings?: WebAppRuntimeSettings;
}

export interface WebAppRuntimeSettings {
  runtimeVersion: string;
  remoteDebuggingSupported: boolean;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
}

export interface AppInsightsSettings {
  isSupported: boolean;
  isDefaultOff?: boolean;
}

export interface GitHubActionSettings {
  isSupported: boolean;
  supportedVersion?: string;
}

export interface JavaContainers {
  linuxContainerSettings?: LinuxJavaContainerSettings;
  windowsContainerSettings?: WindowsJavaContainerSettings;
}

export interface WindowsJavaContainerSettings extends CommonSettings {
  javaContainer: string;
  javaContainerVersion: string;
}

export interface LinuxJavaContainerSettings extends CommonSettings {
  java11Runtime?: string;
  java8Runtime?: string;
}

export interface CommonSettings {
  isPreview?: boolean;
  isDeprecated?: boolean;
  isHidden?: boolean;
  endOfLifeDate?: Date;
  isAutoUpdate?: boolean;
}

export interface WebAppMinorVersion {
  displayText: string;
  value: string;
  stackSettings: WebAppRuntimes | JavaContainers;
}

export interface WebAppMajorVersion {
  displayText: string;
  value: string;
  minorVersions: WebAppMinorVersion[];
}

export interface WebAppStack {
  displayText: string;
  value: string;
  majorVersions: WebAppMajorVersion[];
  preferredOs?: WebAppStackOs;
}

export enum WebAppStackOs {
  linux = 'linux',
  windows = 'windows',
}
