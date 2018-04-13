export interface FunctionInvocations {
    executingJobRunId: string;
    id: string;
    functionId: string;
    functionName: string;
    functionFullName: string;
    functionDisplayTitle: string;
    status: string;
    whenUtc: string;
    duration: number;
    exceptionMessage: string;
    exceptionType: string;
    hostInstanceId: string;
    instanceQueueName: string;
}

export interface FunctionInvocationDetails {
    name: string;
    description: string;
    argInvokeString: string;
    extendedBlobModel: string;
    status: string;
}

export interface FunctionAggregates {
    functionId: string;
    functionFullName: string;
    functionName: string;
    successCount: number;
    failedCount: number;
    isRunning: boolean;
}

export interface FunctionStats {
    startBucket: number;
    start: string;
    totalPass: number;
    totalFail: number;
    totalRun: number;
}