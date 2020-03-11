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
