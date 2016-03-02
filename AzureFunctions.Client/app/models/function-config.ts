export interface FunctionConfig {
    disabled: boolean;
    bindings: FunctionBindings;
}

export interface FunctionBindings {
    input: FunctionBinding[],
    output: FunctionBinding[]
}

export interface FunctionBinding {
    name: string;
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