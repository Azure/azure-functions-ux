import { ResourceId } from 'app/shared/models/arm/arm-obj';
import { FormGroup } from '@angular/forms';

export type ConfigurationOptionType = 'basic' | 'advanced';

export interface ByosInput<T> {
  id: ResourceId;
  data?: T;
}

export interface ByosInputData {
  resourceId: string;
  isFunctionApp: boolean;
  subscriptionId: string;
  location: string;
  os: string; // TODO(michinoy): Change to using OsType, but it will also require Ibiza change.
}

export interface ByosConfigureData extends ByosInputData {
  form: FormGroup;
}

export enum StorageType {
  azureFiles,
  azureBlob,
}

export enum StorageTypeSetting {
  azureFiles = 'AzureFiles',
  azureBlob = 'AzureBlob',
}

export interface ByosData {
  type: StorageType;
  accountName: string;
  shareName: string;
  accessKey: string;
  mountPath: string;
  appResourceId: string;
}

export interface ByosStorageAccounts {
  [key: string]: ByosStorageAccount;
}

export interface ByosStorageAccount {
  type: string;
  accountName: string;
  shareName: string;
  accessKey: string;
  mountPath: string;
  state?: string;
}
