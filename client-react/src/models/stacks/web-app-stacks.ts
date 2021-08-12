// NOTE (krmitta): Should match with the schema coming from the backend: stacks/webapp/2020-06-01/stack.model.ts
import { AppInsightsSettings, CommonSettings, AppStack } from './app-stacks';

export interface WebAppRuntimes {
  linuxRuntimeSettings?: WebAppRuntimeSettings;
  windowsRuntimeSettings?: WebAppRuntimeSettings;
}

export interface WebAppRuntimeSettings extends CommonSettings {
  runtimeVersion: string;
  remoteDebuggingSupported: boolean;
  appInsightsSettings: AppInsightsSettings;
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

export type WebAppStack = AppStack<WebAppRuntimes & JavaContainers>;
