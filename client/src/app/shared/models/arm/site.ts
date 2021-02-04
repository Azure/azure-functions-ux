import { HostingEnvironmentProfile } from './hosting-environment';
import { SiteConfig } from './site-config';

export enum ComputeMode {
  Shared,
  Dedicated,
  Dynamic,
}

export enum SiteAvailabilityState {
  Normal = 'Normal',
  Limited = 'Limited',
  DisasterRecoveryMode = 'DisasterRecoveryMode',
}

export enum HostType {
  Standard = 'Standard',
  Repository = 'Repository',
}

export class SiteProperties {
  properties: { name: string; value: string }[];
}
export interface Site {
  state: string;
  hostNames: string[];
  enabledHostNames?: string[];
  hostNameSslStates: Array<{
    name: string;
    hostType: HostType;
  }>;
  sku: string;
  targetSwapSlot?: string;
  containerSize: number;
  serverFarmId: string;
  defaultHostName: string;
  dailyMemoryTimeQuota?: number;
  enabled?: boolean;
  siteDisabledReason?: number;
  clientAffinityEnabled?: boolean;
  clientCertEnabled?: boolean;
  clientCertMode?: string;
  clientCertExclusionPaths?: string[];
  hostingEnvironmentProfile?: HostingEnvironmentProfile;
  name?: string;
  resourceGroup?: string;
  computeMode?: ComputeMode;
  hyperV: boolean;
  siteProperties?: SiteProperties;
  availabilityState: SiteAvailabilityState;
  inboundIpAddress: string;
  outboundIpAddresses: string;
  possibleInboundIpAddresses: string;
  possibleOutboundIpAddresses: string;
  httpsOnly?: boolean;
  siteConfig?: SiteConfig;
}

export interface CredentialPolicy {
  allow: boolean;
}

export interface PublishingCredentialPolicies {
  ftp: CredentialPolicy;
  scm: CredentialPolicy;
}

// Strongly typed request to create a new slot with sticky settings
export interface CreateSlotRequest {
  location: string;
  properties: {
    serverFarmId: string;
    // When not cloning we provide an empty object for the config
    // When cloning prod, we omit the config
    // When cloning non-prod we provide the config
    siteConfig?: SiteConfig | {};
    httpsOnly?: boolean;
    clientCertEnabled?: boolean;
    clientCertMode?: string;
    clientCertExclusionPaths?: string[];
  };
}
