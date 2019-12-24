export type AppType = 'WebApp' | 'FunctionApp';
export type Blade = 'Create' | 'Config';

export interface WebAppCreateRuntimeStack {
  displayText: string;
  value: string;
  sortOrder: number;
  versions: WebAppCreateRuntimeStackVersion[];
}

export interface WebAppCreateRuntimeStackVersion {
  displayText: string;
  value: string;
  sortOrder: number;
  supportedPlatforms: WebAppCreateSupportedPlatform[];
}

export interface WebAppCreateSupportedPlatform {
  os: string;
  isPreview: boolean;
  applicationInsightSettings: CreateApplicationInsightSettings;
  runtimeVersion: string;
}

export interface WebAppConfigRuntimeStack {
  displayText: string;
  value: string;
  sortOrder: number;
  versions: WebAppConfigRuntimeStackVersion[];
}

export interface WebAppConfigRuntimeStackVersion {
  displayText: string;
  value: string;
  sortOrder: number;
  supportedPlatforms: WebAppConfigSupportedPlatform[];
}

export interface WebAppConfigSupportedPlatform {
  os: string;
  isPreview: boolean;
  applicationInsightSettings: ConfigApplicationInsightSettings;
  runtimeVersion: string;
}

export interface FunctionAppCreateRuntimeStack {
  displayText: string;
  value: string;
  sortOrder: number;
  versions: FunctionAppCreateRuntimeStackVersion[];
}

export interface FunctionAppCreateRuntimeStackVersion {
  displayText: string;
  value: string;
  sortOrder: number;
  supportedPlatforms: FunctionAppCreateSupportedPlatform[];
}

export interface FunctionAppCreateSupportedPlatform {
  os: string;
  isPreview: boolean;
  applicationInsightSettings: CreateApplicationInsightSettings;
  runtimeVersion: string;
}

export interface FunctionAppConfigRuntimeStack {
  displayText: string;
  value: string;
  sortOrder: number;
  versions: FunctionAppConfigRuntimeStackVersion[];
}

export interface FunctionAppConfigRuntimeStackVersion {
  displayText: string;
  value: string;
  sortOrder: number;
  supportedPlatforms: FunctionAppConfigSupportedPlatform[];
}

export interface FunctionAppConfigSupportedPlatform {
  os: string;
  isPreview: boolean;
  applicationInsightSettings: ConfigApplicationInsightSettings;
  runtimeVersion: string;
}

export interface CreateApplicationInsightSettings {
  enabled: boolean;
  defaultOn: boolean;
}

export interface ConfigApplicationInsightSettings {
  enabled: boolean;
}
