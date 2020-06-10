export interface MinorVersion {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
  isRemoteDebuggingEnabled: boolean;
  isEndOfLife?: boolean;
}

export interface MajorVersion {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
  minorVersions: MinorVersion[];
  applicationInsights: boolean;
  isEndOfLife?: boolean;
  allMinorVersionsEndOfLife?: boolean;
}

export interface MinorVersion2 {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
}

export interface MajorVersion2 {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
  minorVersions: MinorVersion2[];
}

export interface Framework {
  name: string;
  display: string;
  dependency?: any;
  majorVersions: MajorVersion2[];
  frameworks?: any;
}

export interface AvailableStack {
  name: string;
  display: string;
  dependency?: string;
  majorVersions: MajorVersion[];
  frameworks: Framework[];
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
  githubActionSettings?: GitHubActionSettings;
}

export interface GitHubActionSettings {
  supported: boolean;
  recommendedVersion?: string; // The version representation between Antares backend and GitHub action might mismatch.
}
