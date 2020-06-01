export interface WebAppStack {
  displayText: string;
  value: string;
  sortOrder: number;
  preferredOs: 'linux' | 'windows';
  majorVersions: WebAppMajorVersion[];
}

export interface WebAppMajorVersion {
  displayText: string;
  value: string;
  minorVersions: WebAppMinorVersion[];
}

export interface WebAppMinorVersion {
  displayText: string;
  value: string;
  platforms: PlatformOptions;
}

export interface PlatformOptions {
  linux?: Platform;
  windows?: Platform;
}

export interface Platform {
  runtimeVersion: string;
  remoteDebuggingEnabled: boolean;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
  isPreview?: boolean; // Stack should be labeled as 'preview'
  isDeprecated?: boolean; // Stack should be hidden unless user is already running that stack
  isHidden?: boolean; // Stack should be hidden unless a feature flag is used
  projectedEndOfLifeDate?: Date; // Stack projected end of life date
}

export interface AppInsightsSettings {
  isEnabled: boolean;
  isDefaultOn?: boolean;
}

export interface GitHubActionSettings {
  isSupported: boolean;
  supportedVersion?: string;
}
