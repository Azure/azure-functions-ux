export type MethodTypes = 'GET' | 'POST' | 'PUT' | 'DELETE';
export interface ArmRequestObject<T> {
  resourceId: string;
  commandName: string;
  method?: MethodTypes;
  body?: T;
  skipBuffer?: boolean;
  apiVersion?: string;
  queryString?: string;
}
export interface HttpResponseObject<T> {
  metadata: {
    success: boolean;
    status: number;
    error?: any;
    headers: { [key: string]: string };
  };
  data: T;
}
