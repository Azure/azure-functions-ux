import { ArmAzureStorageMount } from '../modules/site/config/azureStorageAccounts/reducer';

export interface ArmObj<T> {
  id: string;
  kind?: string;
  properties: T;
  type?: string;
  tags?: { [key: string]: string };
  location?: string;
  name: string;
}

export interface ArmArray<T> {
  value: ArmObj<T>[];
  nextLink?: string | null;
  id?: string;
}

export interface Address {
  address1: string;
  address2: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
}

export interface ApiDefinition {
  url: string;
}

export interface ApplicationLogsConfig {
  fileSystem: FileSystemApplicationLogsConfig;
  azureTableStorage: AzureTableStorageApplicationLogsConfig;
  azureBlobStorage: AzureBlobStorageApplicationLogsConfig;
}

export interface AutoHealActions {
  actionType: number;
  customAction: AutoHealCustomAction;
}

export interface AutoHealCustomAction {
  exe: string;
  parameters: string;
}

export interface AutoHealRules {
  triggers: AutoHealTriggers;
  actions: AutoHealActions;
}

export interface AutoHealTriggers {
  privateBytesInKB: number;
}

export interface AzureBlobStorageApplicationLogsConfig {
  level: number;
  sasUrl: string;
  retentionInDays: number;
}

export interface AzureBlobStorageHttpLogsConfig {
  sasUrl: string;
  retentionInDays: number;
  enabled: boolean;
}

export interface AzureTableStorageApplicationLogsConfig {
  level: number;
  sasUrl: string;
}

export interface BackupDescription {
  version: number;
  name: string;
  hostNames: string;
  databases: DatabaseBackupDescription;
  xmlConfigVersion: string;
}

export interface BackupItem {
  id: number;
  storageAccountUrl: string;
  blobName: string;
  name: string;
  status: number;
  sizeInBytes: number;
  created: Date;
  log: string;
  databases: DatabaseBackupSetting;
  scheduled: boolean;
  lastRestoreTimeStamp: Date;
  finishedTimeStamp: Date;
  correlationId: string;
  websiteSizeInBytes: number;
}

export interface BackupRequest {
  name: string;
  backupName: string;
  enabled: boolean;
  storageAccountUrl: string;
  backupSchedule: BackupSchedule;
  databases: DatabaseBackupSetting;
  type: number;
}

export interface BackupSchedule {
  frequencyInterval: number;
  frequencyUnit: number;
  keepAtLeastOneBackup: boolean;
  retentionPeriodInDays: number;
  startTime: Date;
  lastExecutionTime: Date;
}

export interface Certificate {
  friendlyName: string;
  subjectName: string;
  hostNames: string;
  pfxBlob: number;
  siteName: string;
  selfLink: string;
  issuer: string;
  issueDate: Date;
  expirationDate: Date;
  password: string;
  thumbprint: string;
  valid: boolean;
  toDelete: boolean;
  cerBlob: number;
  publicKeyHash: string;
  hostingEnvironment: string;
  hostingEnvironmentProfile: HostingEnvironmentProfile;
  keyVaultCsmId: string;
  keyVaultSecretName: string;
  webSpace: string;
  serverFarmId: string;
  geoRegion: string;
  name: string;
  tags: { [key: string]: string };
}

export interface CertificateDetails {
  version: number;
  serialNumber: string;
  thumbprint: string;
  subject: string;
  notBefore: Date;
  notAfter: Date;
  signatureAlgorithm: string;
  issuer: string;
  rawData: string;
}

export interface CertificateEmail {
  emailId: string;
  timeStamp: Date;
}

export interface CertificateOrder {
  certificates: { [key: string]: any };
  distinguishedName: string;
  domainVerificationToken: string;
  validityInYears: number;
  keySize: number;
  productType: string;
  autoRenew: boolean;
  provisioningState: string;
  status: string;
  signedCertificate: CertificateDetails;
  csr: string;
  intermediate: CertificateDetails;
  root: CertificateDetails;
  serialNumber: string;
  lastCertificateIssuanceTime: Date;
  expirationTime: Date;
  nextAutoRenewalTimeStamp: Date;
  appServiceCertificateNotRenewableReasons: string;
}

export interface CertificateOrderAction {
  type: string;
  createdAt: Date;
}

export interface CertificateOrderCertificate {
  keyVaultId: string;
  keyVaultSecretName: string;
  provisioningState: number;
  thumbprint: string;
}

export interface CertificatePurchaseLimitOption {
  productType: number;
  validityInYears: number;
  max: number;
}

export interface CloningInfo {
  correlationId: string;
  overwrite: boolean;
  cloneCustomHostNames: boolean;
  cloneSourceControl: boolean;
  sourceWebAppId: string;
  hostingEnvironment: string;
  appSettingsOverrides: { [key: string]: string };
  configureLoadBalancing: boolean;
  trafficManagerProfileId: string;
  trafficManagerProfileName: string;
  ignoreQuotas: boolean;
}

export interface ConnStringInfo {
  name: string;
  connectionString: string;
  type: number;
}

export interface ConnStringValueTypePair {
  value: string;
  type: number;
}

export interface Contact {
  addressMailing: Address;
  email: string;
  fax: string;
  jobTitle: string;
  nameFirst: string;
  nameLast: string;
  nameMiddle: string;
  organization: string;
  phone: string;
}

export interface Cors {
  allowedOrigins: string;
}

export interface CsmSlotEntity {
  targetSlot: string;
  preserveVnet: boolean;
}

export interface Csr {
  name: string;
  distinguishedName: string;
  csrString: string;
  pfxBlob: number;
  password: string;
  publicKeyHash: string;
  hostingEnvironment: string;
}

export interface DatabaseBackupDescription {
  databaseType: string;
  fileName: string;
  connectionStringName: string;
  databaseName: string;
}

export interface DatabaseBackupSetting {
  databaseType: string;
  name: string;
  connectionStringName: string;
  connectionString: string;
}

export interface DeploymentLocations {
  locations: GeoRegion;
  hostingEnvironmentDeploymentInfos: HostingEnvironmentDeploymentInfo;
}

export interface Domain {
  contactAdmin: Contact;
  contactBilling: Contact;
  contactRegistrant: Contact;
  contactTech: Contact;
  registrationStatus: string;
  nameServers: string;
  privacy: boolean;
  targetDnsType: string;
  dnsZoneId: string;
  createdTime: Date;
  expirationTime: Date;
  lastRenewedTime: Date;
  autoRenew: boolean;
  readyForDnsRecordManagement: boolean;
  managedHostNames: HostName;
  consent: DomainPurchaseConsent;
  domainNotRenewableReasons: number;
}

export interface DomainAvailablilityCheckResult {
  name: string;
  available: boolean;
  domainType: number;
}

export interface DomainControlCenterSsoRequest {
  url: string;
  postParameterKey: string;
  postParameterValue: string;
}

export interface DomainPurchaseConsent {
  agreementKeys: string;
  agreedBy: string;
  agreedAt: Date;
}

export interface DomainRecommendationSearchParameters {
  keywords: string;
  maxDomainRecommendations: number;
}

export interface DomainRegistrationInput {
  name: string;
  contactAdmin: Contact;
  contactBilling: Contact;
  contactRegistrant: Contact;
  contactTech: Contact;
  registrationStatus: string;
  nameServers: string;
  privacy: boolean;
  targetDnsType: string;
  dnsZoneId: string;
  createdTime: Date;
  expirationTime: Date;
  lastRenewedTime: Date;
  autoRenew: boolean;
  readyForDnsRecordManagement: boolean;
  managedHostNames: HostName;
  consent: DomainPurchaseConsent;
  domainNotRenewableReasons: number;
}

export interface EnabledConfig {
  enabled: boolean;
}

export interface ErrorEntity {
  code: string;
  message: string;
  extendedCode: string;
  messageTemplate: string;
  parameters: string;
  innerErrors: ErrorEntity;
}

export interface Experiments {
  rampUpRules: RampUpRule;
}

export interface FileSystemApplicationLogsConfig {
  level: number;
}

export interface FileSystemHttpLogsConfig {
  retentionInMb: number;
  retentionInDays: number;
  enabled: boolean;
}

export interface GeoLocation {
  name: string;
  description: string;
  liveSiteAssistConnectionString: string;
}

export interface GeoRegion {
  name: string;
  description: string;
  sortOrder: number;
  displayName: string;
}

export interface HandlerMapping {
  extension: string;
  scriptProcessor: string;
  arguments: string;
}

export interface HostingEnvironment {
  kind: string;
  id: string;
  name: string;
  location: string;
  status: number;
  publicHost: string;
  vNETName: string;
  vNETResourceGroupName: string;
  vNETSubnetName: string;
  virtualNetwork: VirtualNetworkProfile;
  frontEndScaleFactor: number;
  multiSize: string;
  multiRoleCount: number;
  workerPools: WorkerPool;
  iPSSLAddressCount: number;
  databaseEdition: string;
  databaseServiceObjective: string;
  upgradeDomains: number;
  subscriptionId: string;
  dnsSuffix: string;
  lastAction: string;
  lastActionResult: string;
  allowedMultiSizes: string;
  allowedWorkerSizes: string;
  maximumNumberOfMachines: number;
  vipMappings: VirtualIPMapping;
  environmentCapacities: StampCapacity;
  networkAccessControlList: NetworkAccessControlEntry;
  environmentIsHealthy: boolean;
  environmentStatus: string;
  resourceGroup: string;
  apiManagementAccountId: string;
  internalLoadBalancingMode: number;
  clusterSettings: NameValuePair;
  hasLinuxWorkers: boolean;
  suspended: boolean;
}

export interface HostingEnvironmentDeploymentInfo {
  name: string;
  location: string;
}

export interface HostingEnvironmentProfile {
  id: string;
  name: string;
  type: string;
}

export interface HostName {
  name: string;
  siteNames: string;
  azureResourceName: string;
  azureResourceType: number;
  customHostNameDnsRecordType: number;
  hostNameType: number;
}

export interface HostNameSslState {
  name: string;
  sslState: number;
  ipBasedSslResult: string;
  virtualIP: string;
  thumbprint: string;
  toUpdate: boolean;
  toUpdateIpBasedSsl: boolean;
  iPBasedSslState: number;
  hostType: number;
}

export interface HttpLogsConfig {
  fileSystem: FileSystemHttpLogsConfig;
  azureBlobStorage: AzureBlobStorageHttpLogsConfig;
}

export interface Identifier {
  id: string;
}

export interface IpRestrictions {
  ipAddress: string;
  action: string;
  tag: string;
  priority: number;
  name: string;
  description: string;
}

export interface ManagedHostingEnvironment {
  name: string;
  location: string;
  status: number;
  virtualNetwork: VirtualNetworkProfile;
  iPSSLAddressCount: number;
  dnsSuffix: string;
  subscriptionId: string;
  resourceGroup: string;
  environmentIsHealthy: boolean;
  environmentStatus: string;
  suspended: boolean;
  apiManagementAccount: string;
}

export interface NameIdentifier {
  name: string;
}

export interface NameValuePair {
  name: string;
  value: string;
}

export interface NetworkAccessControlEntry {
  action: number;
  description: string;
  order: number;
  remoteSubnet: string;
}

export interface Operation {
  id: string;
  name: string;
  status: number;
  errors: ErrorEntity;
  createdTime: Date;
  modifiedTime: Date;
  expirationTime: Date;
  geoMasterOperationId: string;
}

export interface PublicCertificate {
  blob: number;
  publicCertificateLocation: string;
  thumbprint: string;
  tags: { [key: string]: string };
}

export interface HostNameBinding {
  name: string;
  siteName: string;
  domainId: string;
  azureResourceName: string;
  azureResourceType: number;
  customHostNameDnsRecordType: number;
  hostNameType: number;
  sslState: number;
  thumbprint: string;
  virtualIP: string;
}

export interface PublishingCredentials {
  name: string;
  publishingUserName: string;
  publishingPassword: string;
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

export interface RestoreRequest {
  storageAccountUrl: string;
  blobName: string;
  overwrite: boolean;
  siteName: string;
  databases: DatabaseBackupSetting;
  ignoreConflictingHostNames: boolean;
  skipDnsRegistration: boolean;
  hostNames: string;
  serverFarmName: string;
  appServicePlan: string;
  sKU: string;
  operationType: number;
  adjustConnectionStrings: boolean;
  skipCustomDomainVerification: boolean;
  hostingEnvironment: string;
}

export interface RoutingRule {
  name: string;
}

export interface ScmConstants {
  metadataKeys: string;
  scmType: string;
  scmTypeNone: string;
  scmTypeDropbox: string;
  scmTypeTfs: string;
  scmTypeLocalGit: string;
  scmTypeGitHub: string;
  scmTypeCodePlexGit: string;
  scmTypeCodePlexHg: string;
  scmTypeBitbucketGit: string;
  scmTypeBitbucketHg: string;
  scmTypeExternalGit: string;
  scmTypeExternalHg: string;
  scmTypeOneDrive: string;
  scmTypeVso: string;
  scmUri: string;
  repoApiUri: string;
  repoUrl: string;
  cloneUri: string;
  metadata: string;
  appSettings: string;
  oAuthToken: string;
  oAuthTokenSecret: string;
  oAuthRefreshToken: string;
  oAuthExpirationTime: string;
  publishingPassword: string;
  publishingUsername: string;
  repositoryUri: string;
  gitUriFormat: string;
  projectName: string;
  isNullRepo: string;
  dropboxPath: string;
  dropboxCursor: string;
  dropboxUserName: string;
  dropboxEmail: string;
  oneDriveUserDisplayName: string;
  oneDriveUserAccountEmail: string;
  oneDrivePath: string;
  vsoUserDisplayName: string;
  vsoUserAccountEmail: string;
  vsoTfsImpersonate: string;
  branch: string;
}

export interface ServerFarm {
  serverFarmId: number;
  name: string;
  workerSize: number;
  workerSizeId: number;
  targetWorkerSizeId: number;
  targetWorkerCount: number;
  provisioningState: string;
  numberOfWorkers: number;
  currentWorkerSize: number;
  currentWorkerSizeId: number;
  currentNumberOfWorkers: number;
  status: number;
  webSpace: string;
  subscription: string;
  adminSiteName: string;
  hostingEnvironmentProfile: HostingEnvironmentProfile;
  maximumNumberOfWorkers: number;
  planName: string;
  adminRuntimeSiteName: string;
  computeMode: number;
  siteMode: string;
  geoRegion: string;
  perSiteScaling: boolean;
  numberOfSites: number;
  sKUScaleTime: Date;
  hostingEnvironmentId: string;
  isLinux: boolean;
  isXenon: boolean;
  kind: string;
  reserved: boolean;
  tags: { [key: string]: string };
  resourceGroup: string;
  freeOfferExpirationTime: Date;
}

export interface Site {
  name: string;
  state: string;
  defaultHostName: string;
  hostNames: string[];
  webSpace: string;
  selfLink: string;
  repositorySiteName: string;
  owner: string;
  usageState: number;
  enabled: boolean;
  adminEnabled: boolean;
  enabledHostNames: string[];
  siteProperties: Partial<SiteProperties>;
  availabilityState: number;
  sSLCertificates: Certificate;
  csrs: Csr[];
  cers: Certificate;
  siteMode: string;
  hostNameSslStates: Partial<HostNameSslState>[];
  computeMode: number;
  serverFarm: string;
  serverFarmId: string;
  lastModifiedTimeUtc: string;
  storageRecoveryDefaultState: string;
  contentAvailabilityState: number;
  runtimeAvailabilityState: number;
  siteConfig: Partial<SiteConfig>;
  deploymentId: string;
  trafficManagerHostNames: string;
  sku: string;
  premiumAppDeployed: boolean;
  scmSiteAlsoStopped: boolean;
  targetSwapSlot: string;
  hostingEnvironmentProfile: HostingEnvironmentProfile;
  microService: string;
  gatewaySiteName: string;
  clientAffinityEnabled: boolean;
  clientCertEnabled: boolean;
  hostNamesDisabled: boolean;
  domainVerificationIdentifiers: string;
  kind: string;
  httpsOnly: boolean;
  outboundIpAddresses: string;
  geoRegion: string;
  cloningInfo: CloningInfo;
  hostingEnvironmentId: string;
  tags: { [key: string]: string };
  resourceGroup: string;
  isLinux: boolean;
  isXenon: boolean;
  reserved: boolean;
}

export interface PremierAddOn {
  sku: string;
  product: string;
  vendor: string;
  name: string;
  location: string;
  tags: { [key: string]: string };
  marketplacePublisher: string;
  marketplaceOffer: string;
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

export interface SiteConfig {
  numberOfWorkers: number;
  defaultDocuments: string[];
  netFrameworkVersion: string;
  phpVersion: string;
  pythonVersion: string;
  nodeVersion: string;
  linuxFxVersion: string;
  linuxFxVersionType: string;
  linuxFxVersionValue: string;
  minTlsVersion: string;
  requestTracingEnabled: boolean;
  requestTracingExpirationTime: Date;
  remoteDebuggingEnabled: boolean;
  remoteDebuggingVersion: string | null;
  httpLoggingEnabled: boolean;
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
  scmType: string;
  use32BitWorkerProcess: boolean;
  webSocketsEnabled: boolean;
  alwaysOn: boolean;
  javaVersion: string;
  javaContainer: string;
  javaContainerVersion: string;
  managedPipelineMode: number;
  ftpsState?: 'AllAllowed' | 'FtpsOnly' | 'Disabled';
  http20Enabled?: boolean;
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
  ipSecurityRestrictions: IpRestrictions;
}

export interface PushSettings {
  isPushEnabled: boolean;
  tagWhitelistJson: string;
  tagsRequiringAuth: string;
  dynamicTagsJson: string;
}

export interface SiteLimits {
  maxPercentageCpu: number;
  maxMemoryInMb: number;
  maxDiskSizeInMb: number;
}

export interface SiteLogsConfig {
  applicationLogs: ApplicationLogsConfig;
  httpLogs: HttpLogsConfig;
  failedRequestsTracing: EnabledConfig;
  detailedErrorMessages: EnabledConfig;
}

export interface SiteProperties {
  metadata: NameValuePair[];
  properties: NameValuePair[];
  appSettings: NameValuePair[];
}

export interface SiteSourceControl {
  repoUrl: string;
  branch: string;
  isManualIntegration: boolean;
  deploymentRollbackEnabled: boolean;
  isMercurial: boolean;
}

export interface SkuDescription {
  name: string;
  tier: string;
  size: string;
  family: string;
  capacity: number;
}

export interface SlotConfigNames {
  connectionStringNames: string[] | null;
  appSettingNames: string[] | null;
  azureStorageConfigNames: string[] | null;
}

export interface Snapshot {
  time: Date;
}

export interface StampCapacity {
  name: string;
  availableCapacity: number;
  totalCapacity: number;
  unit: string;
  computeMode: number;
  workerSize: number;
  workerSizeId: number;
  excludeFromCapacityAllocation: boolean;
  isApplicableForAllComputeModes: boolean;
  siteMode: string;
}

export interface TldLegalAgreement {
  agreementKey: string;
  title: string;
  content: string;
  url: string;
}

export interface TopLevelDomain {
  name: string;
  privacy: boolean;
}

export interface TopLevelDomainAgreementOption {
  includePrivacy: boolean;
  forTransfer: boolean;
}

export interface User {
  name: string;
  publishingUserName: string;
  publishingPassword: string;
  lastUpdatedTime: Date;
  metadata: string;
  isDeleted: boolean;
  scmUri: string;
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

export interface VirtualIPMapping {
  virtualIP: string;
  internalHttpPort: number;
  internalHttpsPort: number;
  inUse: boolean;
}

export interface VirtualNetworkProfile {
  id: string;
  name: string;
  type: string;
  subnet: string;
}

export interface WebEnvironment {
  kind: string;
  name: string;
  location: string;
  publicHost: string;
  vNETName: string;
  vNETId: string;
  vNETSubnetName: string;
  vNETSubnetAddressRange: string;
  vNETResourceGroup: string;
  webWorkerSize: string;
  webWorkerRoleCount: number;
  smallDedicatedWebWorkerSize: string;
  smallDedicatedWebWorkerRoleCount: number;
  mediumDedicatedWebWorkerSize: string;
  mediumDedicatedWebWorkerRoleCount: number;
  largeDedicatedWebWorkerSize: string;
  largeDedicatedWebWorkerRoleCount: number;
  frontEndScaleFactor: number;
  multiSize: string;
  multiRoleCount: number;
  iPSSLAddressCount: number;
  databaseEdition: string;
  databaseServiceObjective: string;
  maximumNumberOfMachines: number;
  upgradeDomains: number;
  allowedMultiSizes: string;
  allowedWorkerSizes: string;
  definitionsPath: string;
  settingsPath: string;
  subscriptionId: string;
  serviceAddress: string;
  dnsSuffix: string;
  lastAction: string;
  lastActionResult: string;
  deploymentOrder: number;
  networkAccessControlList: NetworkAccessControlEntry;
  userServiceEndpoint: string;
  customerSubscriptionId: string;
  suspended: boolean;
  extraDefinitions: string;
  manualResumeOnly: boolean;
}

export interface WebQuota {
  webPlan: string;
  computeMode: number;
  quotaName: string;
  resourceName: string;
  limit: number;
  includedAmount: number;
  unit: number;
  period: number;
  exceededAction: number;
  customActionName: string;
  siteMode: string;
  enforcementScope: number;
  sKU: string;
  isRolloverEnabled: boolean;
  rolloverResetUnit: number;
  rolloverResetPeriod: number;
}

export interface WorkerPool {
  workerSizeId: number;
  computeMode: number;
  workerSize: string;
  workerCount: number;
  instanceNames: string;
  sku: SkuDescription;
}

export interface LocalMySQLModel {
  siteId: string;
  location: string;
  otherAppSettings: NameValuePair;
  stickyConfigNames: SlotConfigNames;
  localMySqlEnabled: boolean;
  slowQueryLogEnabled: boolean;
  generalLogEnabled: boolean;
}

export interface PushTag {
  name: string;
  type: number;
  authRequired: boolean;
}

export interface Push {
  enabled: boolean;
  tags: PushTag;
}

export interface UsageQuota {
  value: UsageMetrics;
  nextLink: any;
}

export interface UsageMetrics {
  unit: string;
  nextResetTime: string;
  currentValue: number;
  limit: number;
  name: MetricName;
}

export interface MetricName {
  value: string;
  localizedValue: string;
}

export interface StorageAccount {
  primaryEndpoints: { [key: string]: string };
  primaryLocation: string;
  provisioningState: string;
  secondaryLocation: string;
  statusOfPrimary: string;
  statusOfSecondary: string;
}

export interface Primaryendpoints {
  blob: string;
  file: string;
  queue: string;
  table: string;
}

export interface ApisResult {
  apis: Api;
}

export interface Api {
  name: string;
  permissions: Permission;
  links: Link;
  hasCustomPermissions: boolean;
  get: string;
  post: string;
  put: string;
  patch: string;
  delete: string;
}

export interface ColumnResult {
  columns: Column;
  isSoftDeleteEnabled: boolean;
}

export interface Column {
  name: string;
  type: string;
  isIndexed: boolean;
}

export interface ConnectionString {
  name: string;
  type: number;
  connectionString: string;
}

export interface Gateway {
  id: string;
  name: string;
  type: string;
  location: string;
  url: string;
  properties: GatewayProperties;
}

export interface GatewayProperties {
  host: ResourceReference;
  updatePolicy: string;
}

export interface Keys {
  id: string;
  applicationKey: string;
  masterKey: string;
}

export interface Link {
  href: string;
  rel: string;
}

export interface MobileService {
  id: string;
  name: string;
  type: string;
  location: string;
  properties: MobileServiceProperties;
  userCodeSite: string;
  notificationHub: string;
  sqlDatabase: string;
  sqlServer: string;
}

export interface MobileServiceProperties {
  provisioningState: string;
  gateway: ResourceReference;
  package: PackageProperties;
  host: PackageProperties;
}

export interface ResourceReference {
  id: string;
  resourceName: string;
  resourceType: string;
}

export interface PackageProperties {
  id: string;
  version: string;
}

export interface MobileServiceLink {
  id: string;
  name: string;
  properties: MobileServiceLinkProperties;
  type: string;
}

export interface MobileServiceLinkProperties {
  sourceId: string;
  targetId: string;
  notes: string;
}

export interface PermissionResult {
  permissions: PermissionEntity;
}

export interface PermissionEntity {
  name: string;
  levels: string;
}

export interface ResourceResult {
  resources: Resource;
}

export interface Resource {
  href: string;
  rel: string;
  isSupported: boolean;
  allow: string;
}

export interface ResourceLink {
  name: string;
  id: string;
  properties: ResourceLinkProperties;
}

export interface ResourceLinkProperties {
  sourceId: string;
  targetId: string;
}

export interface ServerFarm {
  id: string;
  name: string;
  type: string;
  location: string;
  properties: ServerFarmProperties;
}

export interface ServerFarmProperties {
  name: string;
  sku: string;
  workerSize: number;
  workerSizeId: number;
  numberOfWorkers: number;
  currentWorkerSize: number;
  currentWorkerSizeId: number;
  currentNumberOfWorkers: number;
  status: string;
  webSpace: string;
  subscription: string;
  adminSiteName: string;
  hostingEnvironment: string;
}

export interface Site {
  id: string;
  name: string;
  type: string;
  location: string;
  properties: SiteProperties;
}

export interface SiteProperties {
  webHostingPlan: string;
  serverFarmId: string;
  hostNames: string;
}

export interface SQLServer {
  id: string;
  name: string;
  kind: string;
  location: string;
  type: string;
  properties: SQLServerProperties;
}

export interface SQLServerProperties {
  administratorLogin: string;
  administratorLoginPassword: string;
  externalAdministratorLogin: string;
  externalAdministratorSid: string;
  fullyQualifiedDomainName: string;
  state: string;
  version: string;
}

export interface TablesResult {
  tables: Table;
}

export interface Table {
  name: string;
  insert: string;
  delete: string;
  update: string;
  read: string;
  undelete: string;
  permissions: Permission;
  links: Link;
  hasCustomPermissions: boolean;
}

export interface Permission {
  name: string;
  level: string;
}

export interface WebJob {
  status: string;
  detailed_status: string;
  log_url: string;
  name: string;
  run_command: string;
  url: string;
  extra_info_url: string;
  type: string;
  error: string;
  using_sdk: boolean;
  settings: WebjobSettings;
  latest_run: WebjobLatestRun;
}

export interface WebjobSettings {
  schedule: string;
}

export interface WebjobLatestRun {
  id: string;
  name: string;
  status: string;
  start_time: Date;
  end_time: Date;
  duration: string;
  output_url: string;
  error_url: any;
  url: string;
  job_name: string;
  trigger: string;
}

export interface SubscriptionBizTalkServiceHybridConnections {
  id: string;
  name: string;
  type: string;
  location: string;
}

export interface AppBizTalkServiceHybridConnections {
  id: string;
  name: string;
  type: string;
  properties: BizTalkHybridConnectionProperties;
}

export interface BizTalkHybridConnectionProperties {
  hostName: string;
  listenerCount: number;
  port: number;
}

export interface SiteBizTalkHybridConnections {
  id: any;
  name: string;
  type: string;
  location: string;
  tags: any;
  properties: SiteBizTalkHybridConnectionsProperty;
}

export interface SiteBizTalkHybridConnectionsProperty {
  entityName: string;
  entityConnectionString: string;
  resourceType: string;
  resourceConnectionString: string;
  hostname: string;
  port: number;
  biztalkUri: string;
}

export interface AppHybridConnections {
  value: AppHybridConnectionValue;
  nextLink: any;
  id: any;
}

export interface AppHybridConnectionValue {
  id: string;
  name: string;
  type: string;
  location: string;
  tags: any;
  properties: AppHybridConnectionProperties;
}

export interface AppHybridConnectionProperties {
  serviceBusNamespace: string;
  relayName: string;
  relayArmUri: string;
  hostname: string;
  port: number;
  sendKeyName: string;
  sendKeyValue: string;
}

export interface AppHybridConnection {
  id: string;
  name: string;
  type: string;
  location: string;
  tags: any;
  properties: HybridConnectionProperties;
}

export interface HybridConnectionProperties {
  path: string;
  createdAt: Date;
  updatedAt: Date;
  requiresClientAuthorization: boolean;
  userMetadata: string;
  listenerCount: number;
}

export interface HybridConnectionKeysData {
  primaryConnectionString: string;
  secondaryConnectionString: string;
  primaryKey: string;
  secondaryKey: string;
  keyName: string;
}

export interface HybridConnectionAuthorizationRulesValue {
  id: string;
  name: string;
  type: string;
  location: string;
  tags: any;
  properties: HybridConnectionAuthorizationRulesProperties;
}

export interface HybridConnectionAuthorizationRulesProperties {
  rights: string;
}

export interface HybridConnectionPlanLimits {
  id: string;
  name: string;
  type: string;
  location: string;
  tags: any;
  properties: HybridConnectionsLimitsProperties;
}

export interface HybridConnectionsLimitsProperties {
  current: number;
  maximum: number;
}

export interface ServiceBusConnectionsRelays {
  id: string;
  name: string;
  type: string;
  location: string;
  tags: any;
  properties: ServiceBusConnectionsRelayProperties;
}

export interface ServiceBusConnectionsRelayProperties {
  path: string;
  createdAt: Date;
  updatedAt: Date;
  requiresClientAuthorization: boolean;
  userMetadata: string;
  listenerCount: number;
}

export interface ServiceBusNamespaces {
  id: string;
  name: string;
  type: string;
  location: string;
  kind: string;
  sku: ServiceBusNamespacesSku;
  tags: ServiceBusNamespacesTags;
  properties: ServiceBusNamespaceProperties;
}

export interface ServiceBusNamespaceProperties {
  provisioningState: string;
  metricId: string;
  status: string;
  createdAt: Date;
  serviceBusEndpoint: string;
  enabled: boolean;
  critical: boolean;
  updatedAt: Date;
  eventHubEnabled: boolean;
  namespaceType: string;
  messagingSku: number;
}

export interface ServiceBusNamespacesSku {
  name: string;
  tier: string;
  capacity: number;
}

export interface ServiceBusNamespacesTags {
  endpoint: string;
}

export interface Permissions {
  actions: string[];
  notActions: string[];
}

export interface PermissionsAsRegExp {
  actions: RegExp[];
  notActions: RegExp[];
}

export interface Lock {
  level: string;
  notes: string;
}

export interface Sku {
  name: string;
  tier?: string;
  size?: string;
  family?: string;
  capacity?: number;
}

export interface AvailableSku {
  sku: Sku;
}

export interface GeoRegion {
  name: string;
  displayName: string;
  sortOrder: number;
}
