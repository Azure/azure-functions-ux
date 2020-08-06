export interface AppStack<T> {
  displayText: string;
  value: string;
  majorVersions: AppStackMajorVersion<T>[];
  preferredOs?: AppStackOs;
}

export interface AppStackMajorVersion<T> {
  displayText: string;
  value: string;
  minorVersions: AppStackMinorVersion<T>[];
}

export interface AppStackMinorVersion<T> {
  displayText: string;
  value: string;
  stackSettings: T;
}

export enum AppStackOs {
  linux = 'linux',
  windows = 'windows',
}

export interface AppInsightsSettings {
  isSupported: boolean;
  isDefaultOff?: boolean;
}

export interface GitHubActionSettings {
  isSupported: boolean;
  supportedVersion?: string;
}

export interface CommonSettings {
  isPreview?: boolean;
  isDeprecated?: boolean;
  isHidden?: boolean;
  endOfLifeDate?: string;
  isAutoUpdate?: boolean;
}
