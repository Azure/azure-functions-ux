export interface NameValuePair {
  name: string;
  value: string;
}

export interface InputFormValues {
  method: string;
  queries: NameValuePair[];
  headers: NameValuePair[];
  xFunctionKey?: string;
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

export interface ResponseContent {
  code: number;
  text?: string;
}

export enum PivotType {
  input = 'input',
  output = 'output',
}

export interface FileContent {
  default: string;
  latest: string;
}

export interface UrlObj {
  key: string;
  text: string;
  type: UrlType;
  url: string;
  data?: any;
}

export enum UrlType {
  Host = 'Host',
  Function = 'Function',
  System = 'System',
}

export const urlParameterRegExp = /\{([^}]+)\}/g;

export enum LoggingOptions {
  appInsights = 'appInsights',
  fileBased = 'fileBased',
}
