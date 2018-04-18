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

export interface AIInvocationTraceHistory {
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
