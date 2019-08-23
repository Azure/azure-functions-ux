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
  tables: AIQueryResultTable[];
}

export interface AIQueryResultTable {
  name: string;
  columns: AIQueryResultTableColumn[];
  rows: any[][];
}

export interface AIQueryResultTableColumn {
  columnName: string;
  dataType: string;
  columnType: string;
}

export interface ApplicationInsight {
  AppId: string;
  Application_Type: string;
  ApplicationId: string;
  CreationDate: Date;
  InstrumentationKey: string;
  Name: string;
}
