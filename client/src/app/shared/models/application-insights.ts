export interface AIMonthlySummary {
    successCount: number;
    failedCount: number;
}

export interface AIInvocationTrace {
    timestamp: string;
    timestampFriendly: string;
    id: string;
    name: string;
    success: boolean;
    resultCode: string;
    duration: number;
    operationId: string;
}

export interface AIInvocationTraceHistory {
    rowId: number;
    message: string;
    itemCount: number;
    logLevel: string;
}

export interface AIQueryResult {
    Tables: AIQueryResultTable[];
}

export interface AIQueryResultTable {
    TableName: string;
    Columns: AIQueryResultTableColumn[];
    Rows: any[][];
}

export interface AIQueryResultTableColumn {
    ColumnName: string;
    DataType: string;
    ColumnType: string;
}
