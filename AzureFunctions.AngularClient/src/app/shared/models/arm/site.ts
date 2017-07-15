export interface Site {
    state: string;
    hostNames: string[];
    hostNameSslStates: [{
        name: string;
        hostType: number;
    }];
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
}
