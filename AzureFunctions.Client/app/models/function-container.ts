﻿export interface FunctionContainer {
    id: string;
    name: string;
    type: string;
    kind: string;
    location: string;
    properties: {
        hostNameSslStates: [{
            name: string;
            hostType: number;
        }];
        sku: string;
        containerSize: number;
        dailyMemoryTimeQuota?: number;
        enabled?: boolean;
        siteDisabledReason?: number;
        state?: string;
    }
    tryScmCred?: string;
}