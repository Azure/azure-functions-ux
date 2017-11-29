import { HostingEnvironmentProfile } from './hosting-environment';

export interface HostNameSslState {
    name: string;
    hostType: number;
    sslState: string;
};

export interface Site {
    state: string;
    hostNames: string[];
    hostNameSslStates: HostNameSslState[];
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
};
