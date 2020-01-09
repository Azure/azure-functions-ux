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

export enum EditorLanguage {
  bat = 'bat',
  csharp = 'csharp',
  fsharp = 'fsharp',
  javascript = 'javascript',
  json = 'json',
  powershell = 'powershell',
  python = 'python',
  typescript = 'typescript',
  markdown = 'markdown',
  php = 'php',
  shell = 'shell',
  plaintext = 'plaintext',
}

export interface ResponseContent {
  code: number;
  text?: string;
}
