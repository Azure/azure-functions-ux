export interface HttpRunModel {
  method: string;
  availableMethods?: string[];
  queryStringParams?: Param[];
  headers?: Param[];
  body: string;
}

export interface Param {
  name: string;
  value: string;
}
