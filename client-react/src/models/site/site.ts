import { SiteProperties } from './site-properties';
import { HostingEnvironmentProfile } from '../hostingEnvironment/hosting-environment-profile';
import { Certificate, Csr } from './certificate';
import { SiteConfig } from './config';
import { CloningInfo } from './cloning-info';
import Url from '../../utils/url';

const useApiVersion20181101 = Url.getParameterByName(null, 'useApiVersion20181101') === 'true';

export type ContentAvailabilityState = 'Normal' | 'ReadOnly' | number;
export type RuntimeAvailabilityState = 'Normal' | 'Degraded' | 'NotAvailable' | number;
export type SiteAvailabilityState = 'Normal' | 'Limited' | 'DisasterRecoveryMode' | number;
export type UsageState = 'Normal' | 'Exceeded' | number;
export type SslState = 'Disabled' | 'SniEnabled' | 'IpBasedEnabled' | number;
export type HostType = 'Standard' | 'Repository' | number;
export type IpBasedSslState = 'NotConfigured' | 'InProgress' | 'Configured' | 'ConfigurationReverted' | number;

export class SiteContants {
  public static ContentAvailabilityStates = {
    Normal: (useApiVersion20181101 ? 'Normal' : 0) as ContentAvailabilityState,
    ReadOnly: (useApiVersion20181101 ? 'ReadOnly' : 1) as ContentAvailabilityState,
  };

  public static RuntimeAvailabilityStates = {
    Normal: (useApiVersion20181101 ? 'Normal' : 0) as RuntimeAvailabilityState,
    Degraded: (useApiVersion20181101 ? 'Degraded' : 1) as RuntimeAvailabilityState,
    NotAvailable: (useApiVersion20181101 ? 'NotAvailable' : 2) as RuntimeAvailabilityState,
  };

  public static SiteAvailabilityStates = {
    Normal: (useApiVersion20181101 ? 'Normal' : 0) as SiteAvailabilityState,
    Limited: (useApiVersion20181101 ? 'Limited' : 1) as SiteAvailabilityState,
    DisasterRecoveryMode: (useApiVersion20181101 ? 'DisasterRecoveryMode' : 2) as SiteAvailabilityState,
  };

  public static UsageStates = {
    Normal: (useApiVersion20181101 ? 'Normal' : 0) as UsageState,
    Exceeded: (useApiVersion20181101 ? 'Exceeded' : 1) as UsageState,
  };

  public static SslStates = {
    Disabled: (useApiVersion20181101 ? 'Disabled' : 0) as SslState,
    SniEnabled: (useApiVersion20181101 ? 'SniEnabled' : 1) as SslState,
    IpBasedEnabled: (useApiVersion20181101 ? 'IpBasedEnabled' : 2) as SslState,
  };

  public static HostTypes = {
    Standard: (useApiVersion20181101 ? 'Standard' : 0) as HostType,
    Repository: (useApiVersion20181101 ? 'Repository' : 1) as HostType,
  };

  public static IpBasedSslStates = {
    NotConfigured: (useApiVersion20181101 ? 'NotConfigured' : 0) as IpBasedSslState,
    InProgress: (useApiVersion20181101 ? 'InProgress' : 1) as IpBasedSslState,
    Configured: (useApiVersion20181101 ? 'Configured' : 2) as IpBasedSslState,
    ConfigurationReverted: (useApiVersion20181101 ? 'ConfigurationReverted' : 3) as IpBasedSslState,
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
