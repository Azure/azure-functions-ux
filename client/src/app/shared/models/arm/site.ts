import { HostingEnvironmentProfile } from './hosting-environment';

export enum ComputeMode {
  Shared,
  Dedicated,
  Dynamic,
}

export enum SiteAvailabilitySates {
  Normal,
  Limited,
  DisasterRecoveryMode,
}

export type AvailabilitySate = SiteAvailabilitySates.Normal | SiteAvailabilitySates.Limited | SiteAvailabilitySates.DisasterRecoveryMode;

export class SiteProperties {
  properties: { name: string; value: string }[];
}
export interface Site {
  state: string;
  hostNames: string[];
  enabledHostNames?: string[];
  hostNameSslStates: Array<{
    name: string;
    hostType: number;
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
  availabilityState: AvailabilitySate;
}
