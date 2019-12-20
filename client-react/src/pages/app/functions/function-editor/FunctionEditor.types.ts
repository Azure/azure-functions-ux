export interface KeyValuePair {
  key: string;
  value: string;
}

export interface InputFormValues {
  httpMethod: string;
  queries: KeyValuePair[];
  headers: KeyValuePair[];
}

export const EmptyKeyValuePair: KeyValuePair = { key: '', value: '' };

export enum HttpMethods {
  Get = 'GET',
  Post = 'POST',
}
