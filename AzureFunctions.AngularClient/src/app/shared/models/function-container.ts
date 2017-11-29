import { HostNameSslState } from '../models/arm/site';

export interface FunctionContainer {
    id: string;
    name: string;
    type: string;
    kind: string;
    location: string;
    properties: {
        hostNameSslStates: HostNameSslState[];
        sku: string;
        containerSize: number;
        dailyMemoryTimeQuota?: number;
        enabled?: boolean;
        siteDisabledReason?: number;
        state?: string;
        defaultHostName?: string;
        lastModifiedTimeUtc?: string;
    };
    tryScmCred?: string;
};
