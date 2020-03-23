import { KeyValue } from './portal-models';

export interface StorageItem {
  data: KeyValue<any>;
  expireDate?: string;
  expired?: boolean;
}

export enum StorageKeys {
  appInsights = 'appInsights',
}
