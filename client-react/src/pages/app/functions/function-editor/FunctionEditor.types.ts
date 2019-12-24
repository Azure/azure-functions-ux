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
  get = 'get',
  post = 'post',
  delete = 'delete',
  head = 'head',
  patch = 'patch',
  put = 'put',
  options = 'options',
  trace = 'trace',
}
