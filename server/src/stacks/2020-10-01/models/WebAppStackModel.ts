import { AppStack, CommonSettings, AppInsightsSettings, GitHubActionSettings } from './AppStackModel';

export type WebAppStack = AppStack<WebAppRuntimes & JavaContainers, WebAppStackValue>;
export type WebAppStackValue = 'dotnet' | 'java' | 'javacontainers' | 'node' | 'php' | 'python' | 'ruby';

export interface WebAppRuntimes {
  linuxRuntimeSettings?: LinuxWebAppRuntimeSettings;
  windowsRuntimeSettings?: WindowsWebAppRuntimeSettings;
}

export interface WebAppRuntimeSettings extends CommonSettings {
  runtimeVersion: string;
  remoteDebuggingSupported: boolean;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
}

export interface WindowsWebAppRuntimeSettings extends WebAppRuntimeSettings {
  // todo (allisonm): add windowsFxVersion once we have backend support
  javaVersion?: string;
  netFrameworkVersion?: string;
  nodeVersion?: string;
  phpVersion?: string;
  pythonVersion?: string;
}

export interface LinuxWebAppRuntimeSettings extends WebAppRuntimeSettings {
  linuxFxVersion?: string;
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
