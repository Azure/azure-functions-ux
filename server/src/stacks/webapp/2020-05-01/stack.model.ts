export interface WebAppConfigStack {
  name: string;
  type: string;
  properties: WebAppConfigStackProperties;
  id?: string;
}

export interface WebAppConfigStackProperties {
  name: string;
  display: string;
  majorVersions: WebAppConfigStackMajorVersion[];
  frameworks: WebAppConfigStackFramework[];
  dependency?: string;
  isDeprecated?: boolean;
}

export interface WebAppConfigStackFramework {
  name: string;
  display: string;
  majorVersions: WebAppConfigStackMajorVersion[];
  dependency?: string;
}

export interface WebAppConfigStackMajorVersion {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
  minorVersions: WebAppConfigStackMinorVersion[];
  applicationInsights: boolean;
  isPreview: boolean;
  isDeprecated: boolean;
  isHidden: boolean;
}

export interface WebAppConfigStackMinorVersion {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
  isRemoteDebuggingEnabled: boolean;
}

export interface WebAppConfigStackVersion {
  sortOrder: number;
  displayText: string;
  value: string;
  supportedPlatform: WebAppConfigStackVersionPlatform[];
}

export interface WebAppConfigStackVersionPlatform {
  sortOrder: number;
  os: string;
  isPreview: boolean;
  isDeprecated: boolean;
  isHidden: boolean;
  applicationInsightsEnabled: boolean;
  remoteDebuggingEnabled: boolean;
  runtimeVersion: string;
}

export interface WebAppCreateStack {
  sortOrder: number;
  displayText: string;
  value: string;
  versions: WebAppCreateStackVersion[];
}

export interface WebAppCreateStackVersion {
  sortOrder: number;
  displayText: string;
  value: string;
  supportedPlatforms: WebAppCreateStackVersionPlatform[];
}

export interface WebAppCreateStackVersionPlatform {
  sortOrder: number;
  os: string;
  isPreview: boolean;
  isDeprecated: boolean;
  isHidden: boolean;
  applicationInsightsEnabled: boolean;
  remoteDebuggingEnabled: boolean;
  runtimeVersion: string;
  githubActionSettings?: WebAppCreateStackVersionPlatformGithubAction;
}

export interface WebAppCreateStackVersionPlatformGithubAction {
  supported: boolean;
  recommendedVersion?: string; // The version representation between Antares backend and GitHub action might mismatch.
}
