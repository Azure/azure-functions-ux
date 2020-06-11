import { SiteProperties } from './site-properties';
import { HostingEnvironmentProfile } from '../hostingEnvironment/hosting-environment-profile';
import { Certificate, Csr } from './certificate';
import { SiteConfig } from './config';
import { CloningInfo } from './cloning-info';
import { KeyValue } from '../portal-models';

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

export type AppOsType = AppOs.linux | AppOs.windows;
