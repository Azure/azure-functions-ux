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
  maxAlwaysReady: number; // min number of instances that need to be ready. This is the default value.
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
    defaultHttpConcurrency: number;
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

// NOTE: This might have more optional properties as required by flex consumption
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

export interface Sku {
  skuCode: string;
  instanceSizes?: InstanceSize[];
  appScaleOut?: AppScaleOut;
  siteConfigProperties?: SiteConfigPropertiesDictionary; // NOTE: If this property on the sku exists then it overrides the one of the version itself
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
