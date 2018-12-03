export interface StorageAccountDeprecated {
  id: string;
  location: string;
  name: string;
  properties: {
    accountType: string;
    creationTime: string;
    provisioningState: string;
  };
}

export interface StorageAccount {
  primaryEndpoints: { [key: string]: string };
  primaryLocation: string;
  provisioningState: string;
  secondaryLocation: string;
  statusOfPrimary: string;
  statusOfSecondary: string;
}

export type StorageAccountKeyPermission = 'Full' | 'Read';

export interface StorageAccountKey {
  permissions: StorageAccountKeyPermission;
  keyName: string;
  value: string;
}

export interface ContainerResult {
  name: string;
  publicAccessLevel: string;
  etag: string;
  lastModified: string;
  metadata?: { [key: string]: string };
  requestId?: string;
  lease?: {
    duration?: string;
    status: string;
    state: string;
  };
  exists?: boolean;
  created?: boolean;
}

export interface ShareResult {
  name: string;
  snapshot?: string;
  etag: string;
  lastModified: string;
  metadata?: { [key: string]: string };
  requestId?: string;
  quota?: string;
  shareStats?: {
    shareUsage?: string;
  };
  exists?: boolean;
  created?: boolean;
}

export interface StorageDirectApiPayload {
  accountName: string;
  accessKey: string;
}
