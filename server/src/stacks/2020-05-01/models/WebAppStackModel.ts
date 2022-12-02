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
  notSupportedInCreates?: boolean;
}
