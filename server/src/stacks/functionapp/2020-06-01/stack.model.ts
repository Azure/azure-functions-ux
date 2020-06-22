type Os = 'linux' | 'windows';
type FunctionExtensionVersion = '~1' | '~2' | '~3';

export interface FunctionAppStack {
  displayText: string;
  value: string;
  majorVersions: FunctionAppMajorVersion[];
  preferredOs?: Os;
}

export interface FunctionAppMajorVersion {
  displayText: string;
  value: string;
  minorVersions: FunctionAppMinorVersion[];
}

export interface FunctionAppMinorVersion {
  displayText: string;
  value: string;
  stackSettings: FunctionAppRuntimes;
}

export interface FunctionAppRuntimes {
  linuxRuntimeSettings?: FunctionAppRuntimeSettings;
  windowsRuntimeSettings?: FunctionAppRuntimeSettings;
}

export interface FunctionAppRuntimeSettings extends CommonSettings {
  runtimeVersion: string;
  remoteDebuggingSupported: boolean;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
  appSettingsDictionary: { [key: string]: any };
  siteConfigPropertiesDictionary: { [key: string]: any };
  supportedFunctionsExtensionVersions: FunctionExtensionVersion[];
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
  isPreview?: boolean; // Stack should be labeled as 'preview'
  isDeprecated?: boolean; // Stack should be hidden unless user is already running that stack
  isHidden?: boolean; // Stack should be hidden unless a feature flag is used
  endOfLifeDate?: Date; // Stack end of life date
  isAutoUpdate?: boolean; // Stack should be labeled as 'auto-update'
}
