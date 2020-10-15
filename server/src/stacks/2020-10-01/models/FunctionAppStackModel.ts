import { AppStack, CommonSettings, AppInsightsSettings, GitHubActionSettings } from './AppStackModel';

export type FunctionAppStack = AppStack<FunctionAppRuntimes, FunctionAppStackValue>;
export type FunctionAppStackValue = 'dotnet' | 'java' | 'node' | 'powershell' | 'python' | 'custom';

type FunctionsExtensionVersion = '~1' | '~2' | '~3';
type FunctionsWorkerRuntime = 'dotnet' | 'node' | 'python' | 'java' | 'powershell' | 'custom';

export interface FunctionAppRuntimes {
  linuxRuntimeSettings?: FunctionAppRuntimeSettings;
  windowsRuntimeSettings?: FunctionAppRuntimeSettings;
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

export interface FunctionAppRuntimeSettings extends CommonSettings {
  runtimeVersion: string;
  remoteDebuggingSupported: boolean;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
  appSettingsDictionary: AppSettingsDictionary;
  siteConfigPropertiesDictionary: SiteConfigPropertiesDictionary;
  supportedFunctionsExtensionVersions: FunctionsExtensionVersion[];
}
