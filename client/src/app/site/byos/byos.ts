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
  os: string;
}

export interface ByosConfigureData extends ByosInputData {
  form: FormGroup;
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
