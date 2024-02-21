import { AxiosHeaderValue } from 'axios';
import { KeyValue } from './models/portal-models';

export type MethodTypes = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export interface ArmRequestObject<T> {
  resourceId: string;
  commandName: string;
  method?: MethodTypes;
  body?: T;
  skipBatching?: boolean;
  apiVersion?: string | null;
  queryString?: string;
  headers?: KeyValue<AxiosHeaderValue | undefined>;
}
export interface HttpResponseObject<T> {
  metadata: {
    success: boolean;
    status: number;
    error?: any;
    headers: KeyValue<AxiosHeaderValue | undefined>;
  };
  data: T;
}

export enum AzureAsyncOperationStatus {
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export enum ProvisioningState {
  Succeeded = 'Succeeded',
  Failed = 'Failed',
}
