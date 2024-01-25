import { AppStack, CommonSettings, AppInsightsSettings, GitHubActionSettings } from './AppStackModel';

export type FunctionAppStack = AppStack<FunctionAppRuntimes, FunctionAppStackValue>;
export type FunctionAppStackValue = 'dotnet' | 'java' | 'node' | 'powershell' | 'python' | 'custom';

type FunctionsWorkerRuntime = 'dotnet' | 'node' | 'python' | 'java' | 'powershell' | 'custom' | 'dotnet-isolated';

export interface FunctionAppRuntimes {
  linuxRuntimeSettings?: FunctionAppRuntimeSettings;
  windowsRuntimeSettings?: FunctionAppRuntimeSettings;
}

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

export interface SiteConfigPropertiesDictionary {
  use32BitWorkerProcess?: boolean;
  linuxFxVersion?: string;
  javaVersion?: string;
  powerShellVersion?: string;
  netFrameworkVersion?: string;
}

// NOTE: This change is something we would like to have for a long time to better support deprecated version on the client side post create.
// This change does need a new api-version for the stacks API
export interface FunctionsExtensionVersion {
  version: '~1' | '~2' | '~3' | '~4';
  isDeprecated: boolean;
  isDefault: boolean;
}

export interface Runtime {
  name: string;
  version: string;
}

export interface FunctionAppConfigPropertiesDictionary {
  runtime: Runtime;
}

export interface Sku {
  skuCode: string;
  instanceSizes?: InstanceMemoryMB[];
  appScaleOut?: MaximumInstanceCount;
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
  sku?: Skus[]; // NOTE: This property gets added on the geomaster side. The static stacks defined on Fusion side will not change
}
