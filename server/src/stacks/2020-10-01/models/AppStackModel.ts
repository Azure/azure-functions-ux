export interface AppStack<T, V> {
  displayText: string;
  value: V;
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

export type AppStackOs = 'linux' | 'windows';

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
  isDefault?: boolean;
  isEarlyAccess?: boolean;
}
