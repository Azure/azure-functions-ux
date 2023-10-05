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

export interface InstanceSize {
  size: string;
  isDefault: boolean;
  concurrencySettings: ConcurrencySetting;
}

export interface AppScaleOut {
  min: number;
  max: number;
  defaultValue: number;
}

export interface ConcurrencySetting {
  // These will be per trigger type. All supported trigger types will be returned everytime.
  http: {
    maxHttpConcurrency: number;
  };
  serviceBus: {
    maxConcurrentCalls: number;
    maxConcurrentSettings: number;
  };
  eventHubs: {
    maxEventBatchSize: number;
  };
  queue: {
    batchSize: number;
  };
}

export interface SiteConfigPropertiesDictionary {
  use32BitWorkerProcess: boolean;
  linuxFxVersion?: string;
  javaVersion?: string;
  powerShellVersion?: string;
  netFrameworkVersion?: string;
}

export interface FunctionsExtensionVersion {
  version: '~1' | '~2' | '~3' | '~4';
  isDeprecated: boolean;
}

export interface Sku {
  skuCode: string;
  instanceSizes?: InstanceSize[];
  alwaysReady?: boolean; // ----- ?? Does it depend on Instance size?
  appScaleOut?: AppScaleOut;
}

export interface FunctionAppRuntimeSettings extends CommonSettings {
  runtimeVersion: string;
  remoteDebuggingSupported: boolean;
  appInsightsSettings: AppInsightsSettings;
  gitHubActionSettings: GitHubActionSettings;
  appSettingsDictionary: AppSettingsDictionary;
  siteConfigPropertiesDictionary: SiteConfigPropertiesDictionary;
  supportedFunctionsExtensionVersions: FunctionsExtensionVersion[];
  sku?: Skus[];
}
