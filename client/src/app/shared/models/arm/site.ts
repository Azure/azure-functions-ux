import { HostingEnvironmentProfile } from './hosting-environment';

export enum ComputeMode {
  Shared,
  Dedicated,
  Dynamic,
}

export type SiteAvailabilityState = 'Normal' | 'Limited' | 'DisasterRecoveryMode';
export class SiteAvailabilityStates {
  static Normal: SiteAvailabilityState = 'Normal';
  static Limited: SiteAvailabilityState = 'Limited';
  static DisasterRecoveryMode: SiteAvailabilityState = 'DisasterRecoveryMode';
}

export type HostType = 'Standard' | 'Repository';
export class HostTypes {
  static Standard: HostType = 'Standard';
  static Repository: HostType = 'Repository';
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
  isXenon?: boolean;
  siteProperties?: SiteProperties;
  availabilityState: SiteAvailabilityState;
}
