import { SiteProperties } from './site-properties';
import { HostingEnvironmentProfile } from '../hostingEnvironment/hosting-environment-profile';
import { Certificate, Csr } from './certificate';
import { SiteConfig } from './config';
import { CloningInfo } from './cloning-info';
import Url from '../../utils/url';

export type ContentAvailabilityState = 'Normal' | 'ReadOnly' | number;
export type RuntimeAvailabilityState = 'Normal' | 'Degraded' | 'NotAvailable' | number;
export type SiteAvailabilityState = 'Normal' | 'Limited' | 'DisasterRecoveryMode' | number;
export type UsageState = 'Normal' | 'Exceeded' | number;
export type SslState = 'Disabled' | 'SniEnabled' | 'IpBasedEnabled' | number;
export type HostType = 'Standard' | 'Repository' | number;
export type IpBasedSslState = 'NotConfigured' | 'InProgress' | 'Configured' | 'ConfigurationReverted' | number;

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

export class SiteContants {
  public static ContentAvailabilityStates =
    Url.getParameterByName(null, 'useApiVersion20181101') === 'true'
      ? {
          Normal: 'Normal' as ContentAvailabilityState,
          ReadOnly: 'ReadOnly' as ContentAvailabilityState,
        }
      : {
          Normal: 0 as ContentAvailabilityState,
          ReadOnly: 1 as ContentAvailabilityState,
        };

  public static RuntimeAvailabilityStates =
    Url.getParameterByName(null, 'useApiVersion20181101') === 'true'
      ? {
          Normal: 'Normal' as RuntimeAvailabilityState,
          Degraded: 'Degraded' as RuntimeAvailabilityState,
          NotAvailable: 'NotAvailable' as RuntimeAvailabilityState,
        }
      : {
          Normal: 0 as RuntimeAvailabilityState,
          Degraded: 1 as RuntimeAvailabilityState,
          NotAvailable: 2 as RuntimeAvailabilityState,
        };

  public static SiteAvailabilityStates =
    Url.getParameterByName(null, 'useApiVersion20181101') === 'true'
      ? {
          Normal: 'Normal' as SiteAvailabilityState,
          Limited: 'Limited' as SiteAvailabilityState,
          DisasterRecoveryMode: 'DisasterRecoveryMode' as SiteAvailabilityState,
        }
      : {
          Normal: 0 as SiteAvailabilityState,
          Limited: 1 as SiteAvailabilityState,
          DisasterRecoveryMode: 2 as SiteAvailabilityState,
        };

  public static UsageStates =
    Url.getParameterByName(null, 'useApiVersion20181101') === 'true'
      ? {
          Normal: 'Normal' as UsageState,
          Exceeded: 'Exceeded' as UsageState,
        }
      : {
          Normal: 0 as UsageState,
          Exceeded: 1 as UsageState,
        };

  public static SslStates =
    Url.getParameterByName(null, 'useApiVersion20181101') === 'true'
      ? {
          Disabled: 'Disabled' as SslState,
          SniEnabled: 'SniEnabled' as SslState,
          IpBasedEnabled: 'IpBasedEnabled' as SslState,
        }
      : {
          Disabled: 0 as SslState,
          SniEnabled: 1 as SslState,
          IpBasedEnabled: 2 as SslState,
        };

  public static HostTypes =
    Url.getParameterByName(null, 'useApiVersion20181101') === 'true'
      ? {
          Standard: 'Standard' as HostType,
          Repository: 'Repository' as HostType,
        }
      : {
          Standard: 0 as HostType,
          Repository: 1 as HostType,
        };

  public static IpBasedSslStates =
    Url.getParameterByName(null, 'useApiVersion20181101') === 'true'
      ? {
          NotConfigured: 'NotConfigured' as IpBasedSslState,
          InProgress: 'InProgress' as IpBasedSslState,
          Configured: 'Configured' as IpBasedSslState,
          ConfigurationReverted: 'ConfigurationReverted' as IpBasedSslState,
        }
      : {
          NotConfigured: 0 as IpBasedSslState,
          InProgress: 1 as IpBasedSslState,
          Configured: 2 as IpBasedSslState,
          ConfigurationReverted: 3 as IpBasedSslState,
        };
}
