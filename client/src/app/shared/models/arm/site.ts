import { HostingEnvironmentProfile } from './hosting-environment';
import { Url } from 'app/shared/Utilities/url';

const useApiVersion20180201 = Url.getParameterByName(null, 'useApiVersion20180201') === 'true';

export enum ComputeMode {
  Shared,
  Dedicated,
  Dynamic,
}

export type SiteAvailabilityState = 'Normal' | 'Limited' | 'DisasterRecoveryMode' | number;
export class SiteAvailabilityStates {
  static Normal: SiteAvailabilityState = useApiVersion20180201 ? 'Normal' : 0;
  static Limited: SiteAvailabilityState = useApiVersion20180201 ? 'Limited' : 1;
  static DisasterRecoveryMode: SiteAvailabilityState = useApiVersion20180201 ? 'DisasterRecoveryMode' : 2;
}

export type HostType = 'Standard' | 'Repository' | number;
export class HostTypes {
  static Standard: HostType = useApiVersion20180201 ? 'Standard' : 0;
  static Repository: HostType = useApiVersion20180201 ? 'Repository' : 1;
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
