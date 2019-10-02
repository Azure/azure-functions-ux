import { SiteProperties } from './site-properties';
import { HostingEnvironmentProfile } from '../hostingEnvironment/hosting-environment-profile';
import { Certificate, Csr } from './certificate';
import { SiteConfig } from './config';
import { CloningInfo } from './cloning-info';

export type ContentAvailabilityState = 'Normal' | 'ReadOnly';
export type RuntimeAvailabilityState = 'Normal' | 'Degraded' | 'NotAvailable';
export type SiteAvailabilityState = 'Normal' | 'Limited' | 'DisasterRecoveryMode';
export type UsageState = 'Normal' | 'Exceeded';
export type SslState = 'Disabled' | 'SniEnabled' | 'IpBasedEnabled';
export type HostType = 'Standard' | 'Repository';
export type IpBasedSslState = 'NotConfigured' | 'InProgress' | 'Configured' | 'ConfigurationReverted';

export class SiteContants {
  public static ContentAvailabilityStates = {
    Normal: 'Normal' as ContentAvailabilityState,
    ReadOnly: 'ReadOnly' as ContentAvailabilityState,
  };

  public static RuntimeAvailabilityStates = {
    Normal: 'Normal' as RuntimeAvailabilityState,
    Degraded: 'Degraded' as RuntimeAvailabilityState,
    NotAvailable: 'NotAvailable' as RuntimeAvailabilityState,
  };

  public static SiteAvailabilityStates = {
    Normal: 'Normal' as SiteAvailabilityState,
    Limited: 'Limited' as SiteAvailabilityState,
    DisasterRecoveryMode: 'DisasterRecoveryMode' as SiteAvailabilityState,
  };

  public static UsageStates = {
    Normal: 'Normal' as UsageState,
    Exceeded: 'Exceeded' as UsageState,
  };

  public static SslStates = {
    Disabled: 'Disabled' as SslState,
    SniEnabled: 'SniEnabled' as SslState,
    IpBasedEnabled: 'IpBasedEnabled' as SslState,
  };

  public static HostTypes = {
    Standard: 'Standard' as HostType,
    Repository: 'Repository' as HostType,
  };

  public static IpBasedSslStates = {
    NotConfigured: 'NotConfigured' as IpBasedSslState,
    InProgress: 'InProgress' as IpBasedSslState,
    Configured: 'Configured' as IpBasedSslState,
    ConfigurationReverted: 'ConfigurationReverted' as IpBasedSslState,
  };
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
  clientCertExclusionPaths: string;
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
