import { HttpResponseObject } from './../ArmHelper.types';
import axios, { AxiosRequestConfig } from 'axios';
import { Guid } from '../utils/Guid';
import { KeyValue } from '../models/portal-models';

export const sendHttpRequest = <T>(options: AxiosRequestConfig) => {
  return axios({
    ...options,
    validateStatus: () => true, // never throw error
  }).then(r => {
    const success = r.status < 400;
    const response: HttpResponseObject<T> = {
      metadata: {
        success,
        status: r.status,
        error: success ? null : r.data,
        headers: r.headers,
      },
      data: r.data,
    };

    return response;
  });
};

export const getJsonHeaders = (): KeyValue<string> => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-ms-client-request-id': Guid.newGuid(),
  };
};

export const getTextHeaders = (): KeyValue<string> => {
  return {
    'Content-Type': 'text/plain',
    Accept: 'text/plain,*/*',
  };
};
