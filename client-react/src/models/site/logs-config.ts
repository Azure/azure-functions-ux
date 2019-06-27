export interface SiteLogsConfig {
  applicationLogs: ApplicationLogsConfig;
  httpLogs: HttpLogsConfig;
  failedRequestsTracing: EnabledConfig;
  detailedErrorMessages: EnabledConfig;
}

export interface ApplicationLogsConfig {
  fileSystem: FileSystemApplicationLogsConfig;
  azureTableStorage: AzureTableStorageApplicationLogsConfig;
  azureBlobStorage: AzureBlobStorageApplicationLogsConfig;
}

export interface FileSystemApplicationLogsConfig {
  level: string;
}

export interface AzureTableStorageApplicationLogsConfig {
  level: string;
  sasUrl: string;
}

export interface AzureBlobStorageApplicationLogsConfig {
  level: string;
  sasUrl: string;
  retentionInDays: number;
}

export interface AzureBlobStorageHttpLogsConfig {
  sasUrl: string;
  retentionInDays: number;
  enabled: boolean;
}

export interface EnabledConfig {
  enabled: boolean;
}

export interface HttpLogsConfig {
  fileSystem: FileSystemHttpLogsConfig;
  azureBlobStorage: AzureBlobStorageHttpLogsConfig;
}

export interface FileSystemHttpLogsConfig {
  retentionInMb: number;
  retentionInDays: number;
  enabled: boolean;
}
