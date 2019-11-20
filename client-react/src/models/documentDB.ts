export interface DatabaseAccount {
  capabilities: string[];
  consistencyPolicy: ConsistencyPolicy;
  cors: string[];
  databaseAccountOfferType: string;
  disableKeyBasedMetadataWriteAccess: false;
  documentEndpoint: string;
  enableAutomaticFailover: boolean;
  enableMultipleWriteLocations: boolean;
  enablePartitionKeyMonitor: boolean;
  failoverPolicies: FailoverPolicy[];
  ipRangeFiler: string;
  isVirtualNetworkFilterEnabled: boolean;
  locations: DocumentLocation[];
  provisioningState: string;
  readLocations: DocumentLocation[];
  virtualNetworkRules: string[];
  writeLocations: DocumentLocation[];
}

export interface KeyList {
  primaryMasterKey: string;
  primaryReadonlyMasterKey: string;
  secondaryMasterKey: string;
  secondaryReadonlyMasterKey: string;
}

export interface ConsistencyPolicy {
  defaultConsistencyLevel: string;
  maxIntervalInSeconds: number;
  maxStalenessPrefix: number;
}

export interface FailoverPolicy {
  failoverPriority: number;
  id: string;
  locationName: string;
}

export interface DocumentLocation {
  documentEndpoint: string;
  failoverPriority: number;
  id: string;
  isZoneRedundant: false;
  locationName: string;
  provisioningState: string;
}
