export interface WebAppConfigStack {
  id?: string;
  name: string;
  type: string;
  properties: WebAppConfigStackProperties;
}

export interface WebAppConfigStackProperties {
  name: string;
  display: string;
  dependency?: string;
  majorVersions: WebAppConfigStackMajorVersion[];
  frameworks: WebAppConfigStackFramework[];
  isDeprecated?: boolean;
}

export interface WebAppConfigStackFramework {
  name: string;
  display: string;
  dependency?: string;
  majorVersions: WebAppConfigStackMajorVersion[];
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
}

export interface FunctionAppStack {
  sortOrder: number;
  displayText: string;
  value: string;
  versions: FunctionAppStackVersion[];
}

export interface FunctionAppStackVersion {
  sortOrder: number;
  displayText: string;
  value: string;
  supportedPlatforms: FunctionAppStackVersionPlatform[];
}

export interface FunctionAppStackVersionPlatform {
  sortOrder: number;
  os: string;
  isPreview: boolean;
  isDeprecated: boolean;
  isHidden: boolean;
  applicationInsightsEnabled: boolean;
  runtimeVersion: string;
}
