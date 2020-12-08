export interface AppInsightsComponent {
  provisioningState: string;
  InstrumentationKey: string;
  ConnectionString: string;
  TenantId: string;
  ApplicationId: string;
  CreationDate: string;
  Name: string;
  AppId: string;
  Ver: string;
  Application_Type?: string;
  Flow_Type?: string;
  Request_Source?: string;
  SamplingPercentage?: number;
}

export interface AppInsightsComponentToken {
  token: string;
  expires: string;
}

export interface AppInsightsMonthlySummary {
  successCount: number;
  failedCount: number;
}

export interface AppInsightsQueryResult {
  tables: AppInsightsQueryResultTable[];
}

export interface AppInsightsQueryResultTable {
  name: string;
  columns: AppInsightsQueryResultTableColumn[];
  rows: any[][];
}

export interface AppInsightsQueryResultTableColumn {
  columnName: string;
  dataType: string;
  columnType: string;
}

export interface AppInsightsInvocationTrace {
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

export interface AppInsightsInvocationTraceDetail {
  rowId: number;
  timestamp: string;
  timestampFriendly: string;
  message: string;
  logLevel: string;
}

export interface AppInsightsOrchestrationTrace {
  timestamp: string;
  timestampFriendly: string;
  id: string;
  name: string;
  DurableFunctionsInstanceId: string;
  DurableFunctionsRuntimeStatus: string;
  DurableFunctionsType: number;
}

export interface AppInsightsOrchestrationTraceDetail {
  rowId: number;
  timestamp: string;
  timestampFriendly: string;
  message: string;
  state: string;
}

export interface AppInsightsEntityTrace {
  timestamp: string;
  timestampFriendly: string;
  id: string;
  name: string;
  DurableFunctionsInstanceId: string;
  DurableFunctionsRuntimeStatus: string;
  DurableFunctionsType: number;
}

export interface AppInsightsEntityTraceDetail {
  rowId: number;
  timestamp: string;
  timestampFriendly: string;
  message: string;
  state: string;
}

export enum AppInsightsKeyType {
  string = 'string',
  keyVault = 'keyVault',
}
