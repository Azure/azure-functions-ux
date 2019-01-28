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
