export enum VSTSLogMessageType {
  Deployment = 0,
  SlotSwap = 1,
  CDDeploymentConfiguration = 2,
  CDSlotCreation = 3,
  CDTestWebAppCreation = 4,
  CDAccountCreated = 5,
  CDDisconnect = 6,
  StartAzureAppService = 7,
  StopAzureAppService = 8,
  RestartAzureAppService = 9,
  Other = 10,
  Sync = 11,
  LocalGitCdConfiguration = 12,
}

export type ProviderType =
  | 'None'
  | 'VSTSRM'
  | 'BitbucketGit'
  | 'BitbucketHg'
  | 'ExternalGit'
  | 'GitHub'
  | 'LocalGit'
  | 'Dropbox'
  | 'DropboxV2'
  | 'OneDrive'
  | 'VSO'
  | 'GitHubAction';

export type ProviderDashboardType = '' | 'zip' | 'ftp' | 'webdeploy' | 'reset' | 'credentials-dashboard';

export enum WorkflowOptions {
  Overwrite = 'overwrite',
  UseExisting = 'useExisting',
}
