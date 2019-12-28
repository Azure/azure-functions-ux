export interface KeyValuePair {
  name: string;
  value: string;
}

export interface InputFormValues {
  method: string;
  queries: KeyValuePair[];
  headers: KeyValuePair[];
}

export const EmptyKeyValuePair: KeyValuePair = { name: '', value: '' };

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
