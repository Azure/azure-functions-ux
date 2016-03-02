export interface FunctionConfig {
    disabled: boolean;
    bindings: FunctionBinding[];
}

export interface FunctionBinding {
    name: string;
    direction: string;
    type: string;
    path: string;
    queueName: string;
    schedule: string;
    runOnStartup: boolean;
    partitionKey: string;
    filter: string;
    tableName: string;
    rowKey: string;
    webHookType: string;
}