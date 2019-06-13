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
  invocationId: string;
}

export interface AIInvocationTraceHistory {
  rowId: number;
  timestamp: string;
  timestampFriendly: string;
  message: string;
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
