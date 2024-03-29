﻿import { HostingEnvironmentProfile } from './arm/hosting-environment';
export interface ServerFarm {
  hostingEnvironmentProfile?: HostingEnvironmentProfile;
  provisioningState?: 'InProgress' | 'Succeeded' | 'Failed';
  hyperV?: boolean;
  isXenon?: boolean;
  numberOfWorkers?: number;
}
