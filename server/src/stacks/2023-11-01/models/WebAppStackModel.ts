import { AppStack, CommonSettings, AppInsightsSettings, GitHubActionSettings } from './AppStackModel';

export type WebAppStack = AppStack<WebAppRuntimes & JavaContainers, WebAppStackValue>;
export type WebAppStackValue = 'dotnet' | 'java' | 'javacontainers' | 'node' | 'php' | 'python' | 'ruby' | 'staticsite' | 'go';

export interface WebAppRuntimes {
  linuxRuntimeSettings?: WebAppRuntimeSettings;
  windowsRuntimeSettings?: WebAppRuntimeSettings;
}

export interface WebAppRuntimeSettings extends CommonSettings {
  runtimeVersion: string;
  remoteDebuggingSupported: boolean;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
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
  java17Runtime?: string;
  java11Runtime?: string;
  java8Runtime?: string;
}
