import { ResourceId } from 'app/shared/models/arm/arm-obj';

export interface ByosInput<T> {
  id: ResourceId;
  data?: T;
}

export interface ByosInputData {
  resourceId: string;
  isFunctionApp: boolean;
  subscriptionId: string;
  location: string;
  os: string;
}

export enum StorageType {
  azureFiles,
  azureBlob,
}

export interface ByosData {
  type: StorageType;
  accountName: string;
  shareName: string;
  accessKey: string;
  mountPath: string;
  appResourceId: string;
}
