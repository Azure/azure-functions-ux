import { HttpResponseObject } from './../ArmHelper.types';
import axios, { AxiosRequestConfig } from 'axios';
import { Guid } from '../utils/Guid';

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

export const getJsonHeaders = (): { [key: string]: string } => {
  return {
    'Content-Type': 'appliation/json',
    Accept: 'application/json',
    'x-ms-client-request-id': Guid.newGuid(),
  };
};
