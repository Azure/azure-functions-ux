export interface WebAppStack {
  displayText: string;
  value: string;
  sortOrder: number;
  majorVersions: WebAppMajorVersion[];
}

export interface WebAppMajorVersion {
  displayText: string;
  value: string;
  sortOrder: number;
  platforms: Platform[];
  minorVersions: WebAppMinorVersion[];
}

export interface WebAppMinorVersion {
  displayText: string;
  value: string;
  sortOrder: number;
  platforms: Platform[];
}

export interface Platform {
  os: 'linux' | 'windows';
  runtimeVersion: string;
  sortOrder: number;
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
