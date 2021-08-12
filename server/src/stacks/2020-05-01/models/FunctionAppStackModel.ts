export interface FunctionAppStack {
  sortOrder: number;
  displayText: string;
  value: string;
  versions: FunctionAppStackVersion[];
}

export interface FunctionAppStackVersion {
  sortOrder: number;
  displayText: string;
  value: string;
  supportedPlatforms: FunctionAppStackVersionPlatform[];
  isDefault: boolean;
}

export interface FunctionAppStackVersionPlatform {
  sortOrder: number;
  os: string;
  isPreview: boolean;
  isDeprecated: boolean;
  isHidden: boolean;
  applicationInsightsEnabled: boolean;
  runtimeVersion: string;
  appSettingsDictionary: any;
  siteConfigPropertiesDictionary: any;
}
