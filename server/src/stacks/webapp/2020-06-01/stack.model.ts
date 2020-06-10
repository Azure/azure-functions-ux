export interface WebAppStack<T = PlatformOptions | JavaContainerSettings> {
  displayText: string;
  value: string;
  sortOrder: number;
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
  platforms: T;
}

export interface PlatformOptions {
  linux?: Platform;
  windows?: Platform;
}

export interface Platform {
  runtimeVersion: string;
  remoteDebuggingSupported: boolean;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
  isPreview?: boolean; // Stack should be labeled as 'preview'
  isDeprecated?: boolean; // Stack should be hidden unless user is already running that stack
  isHidden?: boolean; // Stack should be hidden unless a feature flag is used
  projectedEndOfLifeDate?: Date; // Stack projected end of life date
}

export interface AppInsightsSettings {
  isSupported: boolean;
  isDefaultOff?: boolean;
}

export interface GitHubActionSettings {
  isSupported: boolean;
  supportedVersion?: string;
}

export interface JavaContainerSettings {
  windowsSupport?: WindowsSupport;
  linuxSupport?: LinuxSupport;
  isPreview?: boolean; // Container should be labeled as 'preview'
  isDeprecated?: boolean; // Container should be hidden unless user is already running that container
  isHidden?: boolean; // Container should be hidden unless a feature flag is used
  projectedEndOfLifeDate?: Date; // Container projected end of life date
}

export interface WindowsSupport {
  javaContainer: string;
  javaContainerVersion: string;
}

export interface LinuxSupport {
  java11Runtime?: string;
  java8Runtime?: string;
}
