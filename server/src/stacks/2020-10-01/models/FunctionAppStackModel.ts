/*
   NOTE: Usage of functionAppStacks ARM level API

   1. If clients don't care or need the new "skus" property on "FunctionAppRuntimeSettings", then there are no changes

      Get non-region specific list of functionApp stacks  
      /providers/Microsoft.Web/functionAppStacks?api-version=2020-10-01&removeHiddenStacks=<true or false>&removeDeprecatedStacks=<true or false>

   2. If clients need the data returned by the new "skus" property on "FunctionAppRuntimeSettings", then they need to use specific filter queries
   
      Get non-region specific list of functionApp stacks  
      /providers/Microsoft.Web/functionAppStacks?api-version=2020-10-01&removeHiddenStacks=<true or false>&removeDeprecatedStacks=<true or false>

      Get region specific list of functionApp stacks. This will not return new "skus" property with additional information to avoid the size of the response to be huge  
      /providers/Microsoft.Web/locations/<location>/functionAppStacks?api-version=2020-10-01&removeHiddenStacks=<true or false>&removeDeprecatedStacks=<true or false>

      Get a list of all versions of a particular stack for a given region. This will return list of all versions for the specific stack including "skus" property
      /providers/Microsoft.Web/locations/<location>/functionAppStacks?api-version=2020-10-01&removeHiddenStacks=<true or false>&removeDeprecatedStacks=<true or false>&stack=<stack>
*/

import { AppStack, CommonSettings, AppInsightsSettings, GitHubActionSettings } from './AppStackModel';

export type FunctionAppStack = AppStack<FunctionAppRuntimes, FunctionAppStackValue>;
export type FunctionAppStackValue = 'dotnet' | 'java' | 'node' | 'powershell' | 'python' | 'custom';

type FunctionsExtensionVersion = '~1' | '~2' | '~3' | '~4';
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

// NOTE: When skus property under FunctionAppRuntimeSettings has functionAppConfigProperties set then ignore this dictionary for the particular sku.
export interface SiteConfigPropertiesDictionary {
  use32BitWorkerProcess: boolean;
  linuxFxVersion?: string;
  javaVersion?: string;
  powerShellVersion?: string;
  netFrameworkVersion?: string;
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

// NOTE: New property providing more information on each supported version.
export interface FunctionsExtensionVersionsInfo {
  version: FunctionsExtensionVersion;
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
  supportedFunctionsExtensionVersionsInfo: FunctionsExtensionVersionsInfo[];
  skus?: Sku[]; // NOTE: This property gets added on the geomaster side. The static stacks defined on Fusion side will not contain this.
}
