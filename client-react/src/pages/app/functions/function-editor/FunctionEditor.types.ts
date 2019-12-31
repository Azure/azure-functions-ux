export interface NameValuePair {
  name: string;
  value: string;
}

export interface InputFormValues {
  method: string;
  queries: NameValuePair[];
  headers: NameValuePair[];
}

export const EmptyNameValuePair: NameValuePair = { name: '', value: '' };

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
