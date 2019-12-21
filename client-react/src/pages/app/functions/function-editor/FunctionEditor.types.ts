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
  Get = 'get',
  Post = 'post',
  Delete = 'delete',
  head = 'head',
  patch = 'patch',
  put = 'put',
  options = 'options',
  trace = 'trace',
}
