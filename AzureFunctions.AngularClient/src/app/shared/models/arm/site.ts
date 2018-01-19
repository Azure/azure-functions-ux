import { HostingEnvironmentProfile } from './hosting-environment';

export interface Site {
    state: string;
    hostNames: string[];
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
}
