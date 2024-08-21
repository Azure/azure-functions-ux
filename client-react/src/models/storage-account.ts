import { KeyValue } from './portal-models';

export interface StorageAccount {
  primaryEndpoints: KeyValue<string>;
  primaryLocation: string;
  provisioningState: string;
  secondaryLocation: string;
  statusOfPrimary: string;
  statusOfSecondary: string;
}

export interface BlobContainer {
  defaultEncryptionScope: string;
  deleted: boolean;
  denyEncryptionScopeOverride: boolean;
  hasImmutabilityPolicy: boolean;
  hasLegalHold: boolean;
  immutableStorageWithVersioning: ImmutableStorageWithVersioning;
  enabled: boolean;
  lastModifiedTime: string;
  leaseState: string;
  leaseStatus: string;
  publicAccess: string;
  remainingRetentionDays: number;
}

export interface FileShareContainer {
  lastModifiedTime: string;
  shareQuota: number;
  version: string;
  deleted: true;
  deletedTime: string;
  remainingRetentionDays: number;
}

export interface ImmutableStorageWithVersioning {
  enabled: boolean;
  migrationState?: string;
  timeStamp: string;
}

export interface StorageAccountKeys {
  keys: StorageAccountKey[];
}

export interface StorageAccountKey {
  keyName: string;
  value: string;
  permissions: StorageAccountKeyPermission;
}

export enum StorageAccountKeyPermission {
  Full = 'FULL',
  ReadOnly = 'READ',
}
