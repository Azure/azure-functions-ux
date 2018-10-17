import { Request } from 'express';

export interface ApiRequest<T> extends Request {
  body: T;
}

export interface PassthroughRequestBody {
  url: string;
  arg: string;
  content_type: string;
}
