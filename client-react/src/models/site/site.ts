import { SiteProperties } from './site-properties';
import { HostingEnvironmentProfile } from '../hostingEnvironment/hosting-environment-profile';
import { Certificate, Csr } from './certificate';
import { SiteConfig } from './config';
import { CloningInfo } from './cloning-info';
import { KeyValue } from '../portal-models';
import { MsiIdentity } from '../arm-obj';

export enum ContentAvailabilityState {
  Normal = 'Normal',
  ReadOnly = 'ReadOnly',
}

export enum RuntimeAvailabilityState {
  Normal = 'Normal',
  Degraded = 'Degraded',
  NotAvailable = 'NotAvailable',
}

export enum SiteAvailabilityState {
  Normal = 'Normal',
  Limited = 'Limited',
  DisasterRecoveryMode = 'DisasterRecoveryMode',
}

export enum UsageState {
  Normal = 'Normal',
  Exceeded = 'Exceeded',
}

export enum SslState {
  Disabled = 'Disabled',
  SniEnabled = 'SniEnabled',
  IpBasedEnabled = 'IpBasedEnabled',
}

export enum HostType {
  Standard = 'Standard',
  Repository = 'Repository',
}

export enum IpBasedSslState {
  NotConfigured = 'NotConfigured',
  InProgress = 'InProgress',
  Configured = 'Configured',
  ConfigurationReverted = 'ConfigurationReverted',
}

export enum SiteDisabledReason {
  Undefined = 0,
  FunctionQuotaExceeded = 1,
  Other = 100,
}

export enum ClientCertMode {
  Required = 'Required',
  Optional = 'Optional',
  OptionalInteractiveUser = 'OptionalInteractiveUser',
}

export enum MinTlsVersion {
  tLS10 = '1.0',
  tLS11 = '1.1',
  tLS12 = '1.2',
}

export enum VnetPrivatePortsCount {
  min = 0,
  max = 100,
}

export enum CipherSuite {
  // Order matters here; default cipher suites ordered from most secure to least.
  TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 = 'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
  TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256 = 'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256',
  TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 = 'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
  TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 = 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
  TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 = 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
  TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384 = 'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384',
  TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256 = 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256',
  TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA = 'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
  TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA = 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
  TLS_RSA_WITH_AES_256_GCM_SHA384 = 'TLS_RSA_WITH_AES_256_GCM_SHA384',
  TLS_RSA_WITH_AES_128_GCM_SHA256 = 'TLS_RSA_WITH_AES_128_GCM_SHA256',
  TLS_RSA_WITH_AES_256_CBC_SHA256 = 'TLS_RSA_WITH_AES_256_CBC_SHA256',
  TLS_RSA_WITH_AES_128_CBC_SHA256 = 'TLS_RSA_WITH_AES_128_CBC_SHA256',
  TLS_RSA_WITH_AES_256_CBC_SHA = 'TLS_RSA_WITH_AES_256_CBC_SHA',
  TLS_RSA_WITH_AES_128_CBC_SHA = 'TLS_RSA_WITH_AES_128_CBC_SHA',
}

export interface Site {
  name: string;
  /** @note `state` can be `null` for Function Apps on Azure Container Apps */
  state: string | null;
  defaultHostName: string;
  hostNames: string[];
  webSpace: string;
  selfLink: string;
  repositorySiteName: string;
  owner: string;
  usageState: UsageState;
  enabled: boolean;
  adminEnabled: boolean;
  enabledHostNames: string[];
  siteProperties: Partial<SiteProperties>;
  availabilityState: SiteAvailabilityState;
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
  contentAvailabilityState: ContentAvailabilityState;
  runtimeAvailabilityState: RuntimeAvailabilityState;
  siteConfig: Partial<SiteConfig>;
  deploymentId: string;
  trafficManagerHostNames: string;
  sku: string;
  premiumAppDeployed: boolean;
  scmSiteAlsoStopped: boolean;
  targetSwapSlot: string;
  hostingEnvironmentProfile?: HostingEnvironmentProfile;
  microService: string;
  gatewaySiteName: string;
  clientAffinityEnabled: boolean;
  clientCertEnabled: boolean;
  clientCertMode: ClientCertMode;
  clientCertExclusionPaths: string;
  hostNamesDisabled: boolean;
  domainVerificationIdentifiers: string;
  kind: string;
  httpsOnly: boolean;
  outboundIpAddresses: string;
  geoRegion: string;
  cloningInfo: CloningInfo;
  hostingEnvironmentId: string;
  tags: KeyValue<string>;
  resourceGroup: string;
  isLinux: boolean;
  hyperV: boolean;
  reserved: boolean;
  dailyMemoryTimeQuota: number;
  siteDisabledReason: SiteDisabledReason;
  possibleInboundIpAddresses?: string;
  virtualNetworkSubnetId?: string;
  identity: MsiIdentity;
  vnetImagePullEnabled: boolean;
  keyVaultReferenceIdentity: string;
  sshEnabled?: boolean | null;
  endToEndEncryptionEnabled?: boolean;
}

export interface HostNameSslState {
  name: string;
  sslState: SslState;
  ipBasedSslResult: string;
  virtualIP: string;
  thumbprint: string;
  toUpdate: boolean;
  toUpdateIpBasedSsl: boolean;
  iPBasedSslState: IpBasedSslState;
  hostType: HostType;
}

export enum AppOs {
  linux = 'linux',
  windows = 'windows',
}

export enum PublishingCredentialPolicyType {
  FTP = 'ftp',
  SCM = 'scm',
}

export interface PublishingCredentialPolicies {
  allow: boolean;
}

export interface PublishingCredentialPoliciesContext {
  ftp: PublishingCredentialPolicies;
  scm: PublishingCredentialPolicies;
}
