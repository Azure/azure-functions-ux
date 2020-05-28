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
  sortOrder: number;
  platforms: PlatformOptions;
  minorVersions: WebAppMinorVersion[];
}

export interface WebAppMinorVersion {
  displayText: string;
  value: string;
  sortOrder: number;
  platforms: PlatformOptions;
}

export interface PlatformOptions {
  linux?: Platform;
  windows?: Platform;
}

export interface Platform {
  runtimeVersion: string;
  remoteDebuggingEnabled: boolean;
  viewModifiers: ViewModifiers;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
}

export interface ViewModifiers {
  isPreview: boolean;
  isDeprecated: boolean;
  isHidden: boolean;
  showWithFeatureFlag?: boolean;
  datedEndOfLIfe?: string;
}

export interface AppInsightsSettings {
  isEnabled: boolean;
  isDefaultOn?: boolean;
}

export interface GitHubActionSettings {
  isSupported: boolean;
  supportedVersion?: string;
}
