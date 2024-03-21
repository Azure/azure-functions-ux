import { NameValuePair } from '../name-value-pair';
import { ApiDefinition } from './api-definition';

export enum ScmType {
  None = 'None',
  Dropbox = 'Dropbox',
  Tfs = 'Tfs',
  LocalGit = 'LocalGit',
  GitHub = 'GitHub',
  GitHubAction = 'GitHubAction',
  CodePlexGit = 'CodePlexGit',
  CodePlexHg = 'CodePlexHg',
  BitbucketGit = 'BitbucketGit',
  BitbucketHg = 'BitbucketHg',
  ExternalGit = 'ExternalGit',
  OneDrive = 'OneDrive',
  Vso = 'VSO',
  Vsts = 'VSTSRM',
}

export enum BuildProvider {
  None = 'None',
  GitHubAction = 'GitHubAction',
  AppServiceBuildService = 'AppServiceBuildService',
  Vsts = 'Vsts',
}

export interface SiteConfig {
  numberOfWorkers: number;
  defaultDocuments: string[];
  netFrameworkVersion: string;
  phpVersion: string | null;
  pythonVersion: string;
  nodeVersion: string | null;
  windowsFxVersion: string;
  linuxFxVersion: string;
  minTlsVersion: string;
  minTlsCipherSuite: string | null;
  requestTracingEnabled: boolean;
  requestTracingExpirationTime: Date;
  remoteDebuggingEnabled: boolean;
  remoteDebuggingVersion: string | null;
  httpLoggingEnabled: boolean;
  acrUseManagedIdentityCreds: boolean;
  acrUserManagedIdentityID: string | null;
  logsDirectorySizeLimit: number;
  detailedErrorLoggingEnabled: boolean;
  publishingUsername: string;
  publishingPassword: string;
  push: PushSettings;
  appSettings: NameValuePair[];
  metadata: NameValuePair[];
  connectionStrings: ConnStringInfo[];
  handlerMappings: HandlerMapping[];
  azureStorageAccounts?: ArmAzureStorageMount;
  documentRoot: string;
  scmType: ScmType;
  use32BitWorkerProcess: boolean;
  webSocketsEnabled: boolean;
  alwaysOn: boolean;
  javaVersion: string;
  javaContainer: string;
  javaContainerVersion: string;
  managedPipelineMode: number;
  ftpsState?: 'AllAllowed' | 'FtpsOnly' | 'Disabled';
  http20Enabled?: boolean;
  http20ProxyFlag?: number;
  virtualApplications: VirtualApplication[];
  winAuthAdminState: number;
  winAuthTenantState: number;
  customAppPoolIdentityAdminState: boolean;
  customAppPoolIdentityTenantState: boolean;
  runtimeADUser: string;
  runtimeADUserPassword: string;
  loadBalancing: number;
  routingRules: RoutingRule[];
  experiments: Experiments;
  limits: SiteLimits;
  autoHealEnabled: boolean;
  autoHealRules: AutoHealRules;
  tracingOptions: string;
  vnetName: string;
  siteAuthEnabled: boolean;
  siteAuthSettings: SiteAuthSettings;
  autoSwapSlotName: string;
  apiDefinition: ApiDefinition;
  cors: Cors;
  localMySqlEnabled: boolean;
  appCommandLine: string;
  ipSecurityRestrictions?: IpRestriction[];
  scmIpSecurityRestrictions?: IpRestriction[];
  minimumElasticInstanceCount?: number; // Used to be reservedInstanceCount in 2018-11-01
  functionsRuntimeScaleMonitoringEnabled?: boolean;
  powerShellVersion?: string;
  ClusteringEnabled?: boolean;
  vnetPrivatePortsCount?: number | null;
}

export interface IpRestriction {
  ipAddress: string;
  action: string;
  tag: string;
  priority: number;
  name: string;
  description: string;
}

export interface PushSettings {
  isPushEnabled: boolean;
  tagWhitelistJson: string;
  tagsRequiringAuth: string;
  dynamicTagsJson: string;
}

export interface ConnStringInfo {
  name: string;
  connectionString: string;
  type: string;
}

export interface HandlerMapping {
  extension: string;
  scriptProcessor: string;
  arguments: string;
}

export interface ErrorPageGridItem {
  errorCode: string;
  status: string;
}

export interface AzureStorageMount {
  type: StorageType;
  accountName: string;
  shareName: string;
  accessKey: string;
  mountPath: string;
  protocol?: string;
}

export enum StorageType {
  azureFiles = 'AzureFiles',
  azureBlob = 'AzureBlob',
}

export interface ArmAzureStorageMount {
  [key: string]: AzureStorageMount;
}

export interface VirtualApplication {
  virtualPath: string;
  physicalPath: string;
  virtualDirectory: boolean;
  preloadEnabled?: boolean;
  virtualDirectories?: VirtualDirectory[];
}

export interface VirtualDirectory {
  virtualPath: string;
  physicalPath: string;
}

export interface RoutingRule {
  name: string;
}

export interface Experiments {
  rampUpRules: RampUpRule;
}

export interface ErrorPage {
  statusCode: string;
  contentType: string;
  content?: string;
}

export interface RampUpRule {
  actionHostName: string;
  reroutePercentage: number;
  changeStep: number;
  changeIntervalInMinutes: number;
  minReroutePercentage: number;
  maxReroutePercentage: number;
  changeDecisionCallbackUrl: string;
  name: string;
}

export interface SiteLimits {
  maxPercentageCpu: number;
  maxMemoryInMb: number;
  maxDiskSizeInMb: number;
}

export interface AutoHealTriggers {
  privateBytesInKB: number;
}

export interface AutoHealCustomAction {
  exe: string;
  parameters: string;
}

export interface AutoHealActions {
  actionType: number;
  customAction: AutoHealCustomAction;
}

export interface AutoHealRules {
  triggers: AutoHealTriggers;
  actions: AutoHealActions;
}

export interface SiteAuthSettings {
  enabled: boolean;
  httpApiPrefixPath: string;
  unauthenticatedClientAction: number;
  tokenStoreEnabled: boolean;
  allowedExternalRedirectUrls: string;
  allowedAudiences: string;
  defaultProvider: number;
  legacyMobileCompatibilityMode: boolean;
  appObjectId: string;
  clientId: string;
  clientSecret: string;
  issuer: string;
  validateIssuer: boolean;
  isAadAutoProvisioned: boolean;
  googleClientId: string;
  googleClientSecret: string;
  googleOAuthScopes: string;
  facebookAppId: string;
  facebookAppSecret: string;
  facebookOAuthScopes: string;
  twitterConsumerKey: string;
  twitterConsumerSecret: string;
  microsoftAccountClientId: string;
  microsoftAccountClientSecret: string;
  microsoftAccountOAuthScopes: string;
}

export interface Cors {
  allowedOrigins: string[];
}

export interface Reference {
  reference: string;
  status: string;
  vaultName?: string;
  secretName?: string;
  secretVersion?: string;
  identityType?: string;
  details: string;
  source?: string;
  location?: 'ApplicationSetting' | 'ConnectionString';
}
