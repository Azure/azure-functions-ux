export interface Namespace {
  createdAt: string;
  critical: boolean;
  enabled: boolean;
  eventHubEnabled: true;
  messagingSku: number;
  metricId: string;
  namespaceType: string;
  provisioningState: string;
  status: string;
  updatedAt: string;
}

export interface AuthorizationRule {
  rights: string[];
}

export interface KeyList {
  keyName: string;
  primaryConnectionString: string;
  primaryKey: string;
  secondaryConnectionSTring: string;
  secondaryKey: string;
}
