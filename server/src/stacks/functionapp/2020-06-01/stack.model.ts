export type Os = 'linux' | 'windows';
export type StackValue = 'dotnetCore' | 'dotnetFramework' | 'java' | 'node' | 'powershell' | 'python';

type FunctionsExtensionVersion = '~1' | '~2' | '~3';
type FunctionsWorkerRuntime = 'dotnet' | 'node' | 'python' | 'java' | 'powershell';

export interface FunctionAppStack {
  displayText: string;
  value: StackValue;
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
  appSettingsDictionary: AppSettingsDictionary;
  siteConfigPropertiesDictionary: SiteConfigPropertiesDictionary;
  supportedFunctionsExtensionVersions: FunctionsExtensionVersion[];
}

export interface AppInsightsSettings {
  isSupported: boolean;
  isDefaultOff?: boolean;
}

export interface GitHubActionSettings {
  isSupported: boolean;
  supportedVersion?: string;
}

export interface AppSettingsDictionary {
  FUNCTIONS_WORKER_RUNTIME?: FunctionsWorkerRuntime;
  WEBSITE_NODE_DEFAULT_VERSION?: string;
}

export interface SiteConfigPropertiesDictionary {
  use32BitWorkerProcess: boolean;
  linuxFxVersion?: string;
  javaVersion?: string;
  powerShellVersion?: string;
}

export interface CommonSettings {
  isPreview?: boolean; // Stack should be labeled as 'preview'
  isDeprecated?: boolean; // Stack should be hidden unless user is already running that stack
  isHidden?: boolean; // Stack should be hidden unless a feature flag is used
  endOfLifeDate?: Date; // Stack end of life date
  isAutoUpdate?: boolean; // Stack should be labeled as 'auto-update'
}
