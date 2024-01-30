import { AppStack, CommonSettings, AppInsightsSettings, GitHubActionSettings } from './AppStackModel';

export type FunctionAppStack = AppStack<FunctionAppRuntimes, FunctionAppStackValue>;
export type FunctionAppStackValue = 'dotnet' | 'java' | 'node' | 'powershell' | 'python' | 'custom';

type FunctionsWorkerRuntime = 'dotnet' | 'node' | 'python' | 'java' | 'powershell' | 'custom' | 'dotnet-isolated';

export interface FunctionAppRuntimes {
  linuxRuntimeSettings?: FunctionAppRuntimeSettings;
  windowsRuntimeSettings?: FunctionAppRuntimeSettings;
}

// NOTE: When skus property under FunctionAppRuntimeSettings has functionAppConfigProperties set then ignore this dictionary for the particular sku.
export interface AppSettingsDictionary {
  FUNCTIONS_WORKER_RUNTIME?: FunctionsWorkerRuntime;
  WEBSITE_NODE_DEFAULT_VERSION?: string;
}

export interface InstanceMemoryMB {
  size: string;
  isDefault: boolean;
}

export interface MaximumInstanceCount {
  lowestMaximumInstanceCount: number;
  highestMaximumInstanceCount: number;
  defaultValue: number;
}

// NOTE: When skus property under FunctionAppRuntimeSettings has functionAppConfigProperties set then ignore this dictionary for the particular sku.
export interface SiteConfigPropertiesDictionary {
  use32BitWorkerProcess?: boolean;
  linuxFxVersion?: string;
  javaVersion?: string;
  powerShellVersion?: string;
  netFrameworkVersion?: string;
}

// NOTE: This is a breaking change in this api-version
export interface FunctionsExtensionVersion {
  version: '~1' | '~2' | '~3' | '~4';
  isDeprecated: boolean;
  isDefault: boolean;
}

export interface Runtime {
  name: FunctionsWorkerRuntime;
  version: string;
}

export interface FunctionAppConfigPropertiesDictionary {
  runtime: Runtime;
}

export interface Sku {
  skuCode: string;
  instanceMemoryMB?: InstanceMemoryMB[];
  maximumInstanceCount?: MaximumInstanceCount;
  functionAppConfigProperties?: FunctionAppConfigPropertiesDictionary;
}

export interface FunctionAppRuntimeSettings extends CommonSettings {
  runtimeVersion: string;
  remoteDebuggingSupported: boolean;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
  appSettingsDictionary: AppSettingsDictionary;
  siteConfigPropertiesDictionary: SiteConfigPropertiesDictionary;
  supportedFunctionsExtensionVersions: FunctionsExtensionVersion[];
  skus?: Sku[]; // NOTE: This property gets added on the geomaster side. The static stacks defined on Fusion side will not change
}
