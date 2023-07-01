import { WorkerRuntimeLanguages } from '../../utils/CommonConstants';
import { RuntimeExtensionMajorVersions } from '../functions/runtime-extension';

import { AppInsightsSettings, AppStack, CommonSettings } from './app-stacks';

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
}

export type FunctionAppStack = AppStack<FunctionAppRuntimes>;
