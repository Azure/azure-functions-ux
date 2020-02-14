import { HostingEnvironmentProfile } from './hosting-environment';

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
  clientCertEnabled?: boolean;
  clientAffinityEnabled?: boolean;
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
}
