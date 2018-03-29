export interface AIMonthlySummary {
    successCount: number;
    failedCount: number;
}

export interface AIInvocationTrace {
    timestamp: string;
    id: string;
    name: string;
    success: string;
    resultCode: string;
    duration: number;
    operationId: string;
}

export interface AIInvocationTraceDetail extends AIInvocationTrace {
    url: string;
    performanceBucket: string;
    customDimensions: JSON;
    operationName: string;
    operationParentId: string;
    innerMostMessage: string;
    innerMostMethod: string;
}