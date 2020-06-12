// NOTE (allisonm): Any change to existing properties requires a new API version!

export interface WebAppStack<T extends WebAppRuntimes | JavaContainers> {
  displayText: string;
  value: string;
  majorVersions: WebAppMajorVersion<T>[];
  preferredOs?: 'linux' | 'windows';
}

export interface WebAppMajorVersion<T> {
  displayText: string;
  value: string;
  minorVersions: WebAppMinorVersion<T>[];
}

export interface WebAppMinorVersion<T> {
  displayText: string;
  value: string;
  stackSettings: T;
}

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
  isPreview?: boolean; // Stack should be labeled as 'preview'
  isDeprecated?: boolean; // Stack should be hidden unless user is already running that stack
  isHidden?: boolean; // Stack should be hidden unless a feature flag is used
  endOfLifeDate?: Date; // Stack end of life date
  isAutoUpdate?: boolean; // Stack should be labeled as 'auto-update'
}
