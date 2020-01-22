export interface AppInsightsComponent {
  ver: string;
  applicationId: string;
  appId: string;
  instrumentationKey: string;
  connectionString: string;
  name: string;
  creationDate: string;
  tenantId: string;
  provisioningState: string;
  application_type?: string;
  flow_type?: string;
  requestion_source?: string;
  samplingPercentage?: number;
}

export interface AppInsightsComponentToken {
  token: string;
  expires: string;
}
