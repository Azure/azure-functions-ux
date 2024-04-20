import { AppInsightsSettings, CommonSettings, AppStack } from './app-stacks';
import { WorkerRuntimeLanguages } from '../../utils/CommonConstants';
import { RuntimeExtensionMajorVersions } from '../functions/runtime-extension';

export interface FunctionAppRuntimes {
  linuxRuntimeSettings?: FunctionAppRuntimeSettings;
  windowsRuntimeSettings?: FunctionAppRuntimeSettings;
}

export interface AppSettingsDictionary {
  FUNCTIONS_WORKER_RUNTIME?: WorkerRuntimeLanguages;
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
  appSettingsDictionary: AppSettingsDictionary;
  siteConfigPropertiesDictionary: SiteConfigPropertiesDictionary;
  supportedFunctionsExtensionVersions: RuntimeExtensionMajorVersions[];
  Sku?: SkuType[];
}

export interface InstanceSize {
  size: number;
  isDefault: boolean;
}

export interface MaximumInstanceCountSettings {
  lowestMaximumInstanceCount: number;
  highestMaximumInstanceCount: number;
  defaultValue: number;
}

export interface FunctionAppConfigProperties {
  runtime: {
    name: string;
    version: string;
  };
}

export interface SkuType {
  skuCode: string;
  instanceMemoryMB: InstanceSize[];
  maximumInstanceCount: MaximumInstanceCountSettings;
  functionAppConfigProperties: FunctionAppConfigProperties;
}

export type FunctionAppStack = AppStack<FunctionAppRuntimes>;
